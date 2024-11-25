export default new class Bootstrap
{
  /**
   * @param {Object} bootstrapMap Map of services to bootstrap.
   * @param {Function|Object} configLocator Must be a function or an object with a find method.
   * @param {Function|Object} serviceLocator Must be a function or an object with a locate method.
   */
  async bootstrap(bootstrapMap, configLocator, serviceLocator)
  {
    this.#validateBootstrapMap(bootstrapMap)
    this.#validateConfigLocator(configLocator)
    this.#validateServiceLocator(serviceLocator)

    const
      locateConfig  = this.#normalizeConfigLocator(configLocator),
      locateService = this.#normalizeServiceLocator(serviceLocator)

    for(const [id, serviceName] of Object.entries(bootstrapMap))
    {
      if(serviceName === false)
      {
        continue
      }

      const normalizedServiceName = this.#normalizeServiceName(serviceName, id)
      await this.#bootstrapService(normalizedServiceName, locateService, locateConfig)
    }
  }

  #validateBootstrapMap(bootstrapMap)
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

  #validateConfigLocator(configLocator)
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

  #validateServiceLocator(serviceLocator)
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

  #normalizeConfigLocator(configLocator)
  {
    return configLocator.find 
         ? configLocator.find.bind(configLocator) 
         : configLocator
  }

  #normalizeServiceLocator(serviceLocator)
  {
    return serviceLocator.locate 
         ? serviceLocator.locate.bind(serviceLocator) 
         : serviceLocator
  }

  #normalizeServiceName(serviceName, id)
  {
    // if the service name is true, then use the id as the name
    return serviceName === true 
         ? id 
         : serviceName
  }

  async #bootstrapService(serviceName, locateService, locateConfig)
  {
    try
    {
      const
        service = await locateService(serviceName),
        config  = await locateConfig(serviceName)

      if(typeof service.bootstrap === 'function')
      {
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
}