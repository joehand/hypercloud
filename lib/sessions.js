var assert = require('assert')
var jwt = require('jsonwebtoken')

// exported api
// =

module.exports = class Sessions {
  constructor (config) {
    this.options = config.sessions
    this.secret = config.sessions.secret
    delete this.options.secret
    assert(this.secret, 'config.sessions.secret is required')
    assert(this.options.algorithm, 'config.sessions.algorithm is required')
  }

  middleware () {
    return (req, res, next) => {
      // pull token out of auth or cookie header
      var authHeader = req.header('authorization')
      if (authHeader && authHeader.indexOf('Bearer') > -1) {
        res.locals.session = this.verify(authHeader.slice('Bearer '.length))
      } else if (req.cookies && req.cookies.sess) {
        res.locals.session = this.verify(req.cookies.sess)
      }
      next()
    }
  }

  verify (token) {
    try {
      // return decoded session or null on failure
      return jwt.verify(token, this.secret, { algorithms: [this.options.algorithm] })
    } catch (e) {
      return null
    }
  }

  generate (userRecord) {
    return jwt.sign(
      {
        id: userRecord.id,
        scopes: userRecord.scopes
      },
      this.secret,
      this.options
    )
  }
}
