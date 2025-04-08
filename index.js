import Log from '@superhero/log'

const log = new Log({ label: '[BOOTSTRAP]' })

/**
 * @param {Object} bootstrapMap Map of services to bootstrap.
 * @param {Function|Object} configLocator Must be a function or an object with a find method.
 * @param {Function|Object} serviceLocator Must be a function or an object with a locate method.
 */
export default async function bootstrap(bootstrapMap, configLocator, serviceLocator)
{
  validateBootstrapMap(bootstrapMap)
  validateConfigLocator(configLocator)
  validateServiceLocator(serviceLocator)

  const
    locateConfig  = normalizeConfigLocator(configLocator),
    locateService = normalizeServiceLocator(serviceLocator)

  for(const [serviceName, configPath] of Object.entries(bootstrapMap))
  {
    if(configPath === false)
    {
      continue
    }

    const normalizedConfigPath = normalizeConfigPath(serviceName, configPath)
    await bootstrapService(serviceName, locateService, locateConfig, normalizedConfigPath)
  }
}

function validateBootstrapMap(bootstrapMap)
{
  const bootstrapMapType = Object.prototype.toString.call(bootstrapMap)

  if(bootstrapMapType !== '[object Object]')
  {
    const error = new TypeError('BootstrapMap must be type [object Object]')
    error.code  = 'E_BOOTSTRAP_INVALID_MAP'
    error.cause = new TypeError(`Invalid bootstrapMap type "${bootstrapMapType}"`)
    throw error
  }
}

function validateConfigLocator(configLocator)
{
  const
    configLocatorType     = Object.prototype.toString.call(configLocator),
    configLocatorFindType = Object.prototype.toString.call(configLocator?.find)

  if(configLocatorType     !== '[object Function]'
  && configLocatorFindType !== '[object Function]')
  {
    const error   = new TypeError('ConfigLocator must be a function, or an object with a "find" method')
    error.code    = 'E_BOOTSTRAP_INVALID_CONFIG_LOCATOR'
    const reason  = new TypeError(`Invalid configLocator.find type "${configLocatorFindType}"`)
    reason.cause  = new TypeError(`Invalid configLocator type "${configLocatorType}"`)
    error.cause   = reason
    throw error
  }
}

function validateServiceLocator(serviceLocator)
{
  const
    serviceLocatorType       = Object.prototype.toString.call(serviceLocator),
    serviceLocatorLocateType = Object.prototype.toString.call(serviceLocator?.locate)

  if(serviceLocatorType        !== '[object Function]'
  && serviceLocatorLocateType  !== '[object Function]')
  {
    const error   = new TypeError('ServiceLocator must be a function, or an object with a "locate" method')
    error.code    = 'E_BOOTSTRAP_INVALID_SERVICE_LOCATOR'
    const reason  = new TypeError(`Invalid serviceLocator.locate type "${serviceLocatorLocateType}"`)
    reason.cause  = new TypeError(`Invalid serviceLocator type "${serviceLocatorType}"`)
    error.cause   = reason
    throw error
  }
}

function normalizeConfigLocator(configLocator)
{
  return configLocator.find 
       ? configLocator.find.bind(configLocator) 
       : configLocator
}

function normalizeServiceLocator(serviceLocator)
{
  return serviceLocator.locate 
       ? serviceLocator.locate.bind(serviceLocator) 
       : serviceLocator
}

/**
 * if the service name is true
 * then use the same name as the service to locate the config
 */
function normalizeConfigPath(serviceName, configPath)
{
  return configPath === true 
       ? serviceName
       : configPath
}

/**
 * remove the first segment of the path if it starts with "@"
 */
function simplifyConfigPath(configPath)
{
  const 
    splitted = configPath.split('/'),
    filtered = splitted.filter((segment, i) => false === (0 === i && segment[0] === '@')),
    joined   = filtered.join('/')

  return joined
}

async function bootstrapService(serviceName, locateService, locateConfig, configPath)
{
  try
  {
    const
      service = await locateService(serviceName),
      config  = await locateConfig(configPath)
             ?? await locateConfig(simplifyConfigPath(configPath))

    if(typeof service.bootstrap === 'function')
    {
      config
      ? log.info`${serviceName}`
      : log.info`${serviceName} (no config)`

      await service.bootstrap(config)
    }
    else
    {
      const error = new TypeError(`Expecting the service "${serviceName}" to have a "bootstrap" method`)
      error.code  = 'E_BOOTSTRAP_INVALID_SERVICE_INTERFACE'
      throw error
    }
  }
  catch(reason)
  {
    const error = new Error(`Could not fullfill the bootstrap process for "${serviceName}"`)
    error.code  = 'E_BOOTSTRAP'
    error.cause = reason
    throw error
  }
}