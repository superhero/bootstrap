import assert     from 'node:assert'
import bootstrap  from '@superhero/bootstrap'
import Locator    from '@superhero/locator'
import { before, beforeEach, suite, test } from 'node:test'

suite('@superhero/bootstrap', () =>
{
  let config, locator

  before(async () =>
  {
    locator = new Locator()
    config  = await locator.lazyload('@superhero/config')
  })

  beforeEach(() => 
  {
    locator.clear()
  })

  test('Bootstrap a simple process with no problem', async () =>
  {
    const bootstrapMap = 
    {
      serviceA: true,
      serviceB: true,
    }

    let 
      hasBootrappedServiceA = false,
      hasBootrappedServiceB = false

    locator.set('serviceA', new class { bootstrap() { hasBootrappedServiceA = true } })
    locator.set('serviceB', new class { bootstrap() { hasBootrappedServiceB = true } })

    await assert.doesNotReject(
      async () => bootstrap.bootstrap(bootstrapMap, config, locator), 
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

    locator.set('serviceA', new class { bootstrap() { throw 'Bootstrap for serviceA should not trigger' } })
    locator.set('serviceB', new class { bootstrap() { hasBootrappedServiceB = true } })

    await assert.doesNotReject(
      bootstrap.bootstrap(bootstrapMap, config, locator),
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

    locator.set('serviceA', new class 
    {
      bootstrap(config)
      {
        hasBootrappedServiceA = true
        assert.strictEqual(config.foo, 'bar', 'Should have passed along the configuration')
      }
    })

    locator.set('serviceB', new class 
    {
      bootstrap(config)
      {
        hasBootrappedServiceB = true
        assert.strictEqual(config.baz, 'qux', 'Should have passed along the configuration')
      }
    })

    await assert.doesNotReject(
      bootstrap.bootstrap(bootstrapMap, config, locator),
      'Should skip services marked as false')

    assert.ok(hasBootrappedServiceA, 'Should have bootstrapped serviceA')
    assert.ok(hasBootrappedServiceB, 'Should have bootstrapped serviceB')
  })

  suite('Rejects', () =>
  {
    test('If a bootstrap process throws', async () =>
    {
      const bootstrapMap = { serviceA: true }
  
      locator.set('serviceA', new class { bootstrap() { throw 'bootstrap for serviceA should not be triggered' } })
  
      await assert.rejects(
        bootstrap.bootstrap(bootstrapMap, config, locator),
        (error) => error.code === 'E_BOOTSTRAP',
        'Should reject with error for failed bootstrap process')
    })
  
    test('Using an invalid bootstrapMap', async () =>
    {
      await assert.rejects(
        bootstrap.bootstrap(null, config, locator), 
        (error) => error.code === 'E_BOOTSTRAP_INVALID_MAP', 
        'Should reject with error for invalid bootstrapMap')
    })
  
    test('Using an invalid configLocator', async () =>
    {
      await assert.rejects(
        bootstrap.bootstrap({}, null, locator), 
        (error) => error.code === 'E_BOOTSTRAP_INVALID_CONFIG_LOCATOR', 
        'Should reject with error for invalid configLocator')
    })
  
    test('Using an invalid serviceLocator', async () =>
    {
      await assert.rejects(
        bootstrap.bootstrap({}, config, null),
        (error) => error.code === 'E_BOOTSTRAP_INVALID_SERVICE_LOCATOR',
        'Should reject with error for invalid serviceLocator')
    })
  
    test('Service does not implement "bootstrap"', async () =>
    {
      const bootstrapMap = { serviceA: true }
  
      locator.set('serviceA', new class {})
  
      await assert.rejects(
        bootstrap.bootstrap(bootstrapMap, config, locator), 
        (error) => error.code === 'E_BOOTSTRAP' && error.cause.code === 'E_BOOTSTRAP_INVALID_SERVICE_INTERFACE', 
        'Should reject with error for invalid service interface')
    })
  })
})
