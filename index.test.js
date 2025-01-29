import assert     from 'node:assert'
import bootstrap  from '@superhero/bootstrap'
import Locate     from '@superhero/locator'
import { beforeEach, suite, test } from 'node:test'

suite('@superhero/bootstrap', () =>
{
  let config, locate

  beforeEach(() => 
  {
    locate = new Locate()
    config = locate.config
  })

  test('Can bootstrap a simple process with no problem', async () =>
  {
    const bootstrapMap = 
    {
      serviceA: true,
      serviceB: true,
    }

    let 
      hasBootrappedServiceA = false,
      hasBootrappedServiceB = false

    locate.set('serviceA', new class { bootstrap() { hasBootrappedServiceA = true } })
    locate.set('serviceB', new class { bootstrap() { hasBootrappedServiceB = true } })

    await assert.doesNotReject(
      async () => bootstrap(bootstrapMap, config, locate), 
      'Should bootstrap services without error')

    assert.ok(hasBootrappedServiceA, 'Should have bootstrapped serviceA')
    assert.ok(hasBootrappedServiceB, 'Should have bootstrapped serviceB')
  })

  test('Skips services that are defined as "false" in the bootstrap map', async () =>
  {
    const bootstrapMap = 
    {
      serviceA: false,
      serviceB: true,
    }

    let hasBootrappedServiceB = false

    locate.set('serviceA', new class { bootstrap() { throw 'Bootstrap for serviceA should not trigger' } })
    locate.set('serviceB', new class { bootstrap() { hasBootrappedServiceB = true } })

    await assert.doesNotReject(
      bootstrap(bootstrapMap, config, locate),
      'Should skip services marked as false')

    assert.ok(hasBootrappedServiceB, 'Should have bootstrapped serviceB')
  })

  test('Configurations are passed along to the bootstrap', async () =>
  {
    const bootstrapMap = 
    {
      serviceA: true,
      serviceB: true,
    }

    config.assign(
    { 
      serviceA: { foo: 'bar' },
      serviceB: { baz: 'qux' },
    })

    let 
      hasBootrappedServiceA = false,
      hasBootrappedServiceB = false

    locate.set('serviceA', new class 
    {
      bootstrap(config)
      {
        hasBootrappedServiceA = true
        assert.strictEqual(config.foo, 'bar', 'Should have passed along the configuration')
      }
    })

    locate.set('serviceB', new class 
    {
      bootstrap(config)
      {
        hasBootrappedServiceB = true
        assert.strictEqual(config.baz, 'qux', 'Should have passed along the configuration')
      }
    })

    await assert.doesNotReject(
      bootstrap(bootstrapMap, config, locate),
      'Should skip services marked as false')

    assert.ok(hasBootrappedServiceA, 'Should have bootstrapped serviceA')
    assert.ok(hasBootrappedServiceB, 'Should have bootstrapped serviceB')
  })

  suite('Rejects', () =>
  {
    test('Bootstrap process that throws', async () =>
    {
      const bootstrapMap = { serviceA: true }
  
      locate.set('serviceA', new class { bootstrap() { throw 'bootstrap for serviceA should not be triggered' } })
  
      await assert.rejects(
        bootstrap(bootstrapMap, config, locate),
        (error) => error.code === 'E_BOOTSTRAP',
        'Should reject with error for failed bootstrap process')
    })
  
    test('Using an invalid bootstrapMap', async () =>
    {
      await assert.rejects(
        bootstrap(null, config, locate), 
        (error) => error.code === 'E_BOOTSTRAP_INVALID_MAP', 
        'Should reject with error for invalid bootstrapMap')
    })
  
    test('Using an invalid configLocator', async () =>
    {
      await assert.rejects(
        bootstrap({}, null, locate), 
        (error) => error.code === 'E_BOOTSTRAP_INVALID_CONFIG_LOCATOR', 
        'Should reject with error for invalid configLocator')
    })
  
    test('Using an invalid serviceLocator', async () =>
    {
      await assert.rejects(
        bootstrap({}, config, null),
        (error) => error.code === 'E_BOOTSTRAP_INVALID_SERVICE_LOCATOR',
        'Should reject with error for invalid serviceLocator')
    })

    test('Service does not implement "bootstrap"', async () =>
    {
      const bootstrapMap = { serviceA: true }
  
      locate.set('serviceA', new class {})
  
      await assert.rejects(
        bootstrap(bootstrapMap, config, locate), 
        (error) => error.code === 'E_BOOTSTRAP' && error.cause.code === 'E_BOOTSTRAP_INVALID_SERVICE_INTERFACE', 
        'Should reject with error for invalid service interface')
    })
  })
})
