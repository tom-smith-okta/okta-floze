
const request = require('request')

// const utils = require(process.env.DEMO_FS_HOME + '/utils/utils.js')

const config = require("../config.json")

const utils = require('../utils/utils.js')

////////////////////////////////////////////////////

module.exports = function(app){
	app.post('/code', function (req, res) {

		const code = req.body.code

		const flow_name = req.body.flow_name

		const client_id = config[flow_name].client_id

		const client_secret = process.env[client_id]

		console.log("flow name: " + flow_name)

		console.log("client_id: " + client_id)

		var options = {
			'method': 'POST',
			'url': config[flow_name].issuer + '/v1/token',
			'headers': {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			form: {
				'grant_type': 'authorization_code',
				'redirect_uri': process.env.REDIRECT_URI_BASE + "/" + flow_name,
				'code': code,
				'client_id': client_id,
				'client_secret': client_secret
			}
		}

		console.dir(options)

		request(options, function (error, response) { 
			if (error) {
				res.json({"error": "something went wrong with the token reques to okta"})
				return
			}

			console.log(response.body)

			var obj = JSON.parse(response.body)

			console.log("the access token is: ")

			console.log(obj.access_token)

			// req.session.access_token = obj.access_token

			// console.log("the access token in the session is:")

			// console.log(req.session.access_token)

			res.json({"access_token": obj.access_token})
		})
	})
}
