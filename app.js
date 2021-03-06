////////////////////////////////////////////////////

require('dotenv').config()

const axios = require('axios').default

const express = require('express')

const mustacheExpress = require('mustache-express')

///////////////////////////////////////////////////

const config = require("./config.json")

const utils = require('./utils/utils.js')

///////////////////////////////////////////////////

const app = express()

var port = process.env.PORT || 3000

app.use(express.static('public'))

app.use(express.urlencoded({extended: true}))

app.use(express.json())

app.engine('html', mustacheExpress())

app.set('view engine', 'html')

app.listen(port, function () {
	console.log('App listening on port ' + port + '...')
})

//////////////////////////////////////////////////
// ROUTES
//////////////////////////////////////////////////

require('./routes/admin')(app)
require('./routes/authz_code')(app)
require('./routes/demo_list')(app)
require('./routes/saml_inline_hook')(app)

//////////////////////////////////////////////////

app.get('/favicon.ico', function (req, res) {
	res.sendStatus(200)
})

app.get('/', function (req, res) {

	let obj = {
		title: "home",
		flows: [],
		home: true,
		flow_name: "home"
	}
	
	for (const flow in config) {

		let this_flow = {
			name: flow
		}

		const vals = config[flow]
	
		for (const val in vals) {
			this_flow[val] = vals[val]
		}

		obj.flows.push(this_flow)	
	}

	res.render ('index', obj)
})

app.get('/kill_app_session', function (req, res) {

	console.log("attempting to kill app session...")

	req.session.destroy(function(err) {
		if (err) {
			console.log (err)
		}
		else {
			console.log("app session was killed.")
		}
		res.sendStatus(200)
	})
})

app.get('/:flow_name', function (req, res) {

	const flow_name = req.params.flow_name

	console.log("the flow name is: " + req.params.flow_name)

	wake_up_webhook_svc()

	utils.flow_name_is_valid(flow_name)
	.then(flow_name => utils.get_settings(flow_name))
	.then(settings => send_page(flow_name, settings, res))
	.catch(err => res.json(err))
})

//////////////////////////////////////////////////

function send_page(flow_name, settings, res) {

	return new Promise(function(resolve, reject) {

		console.log("the final settings are:")
		console.dir(settings)

		res.render('index', settings)

		resolve(true)
	})	
}

function wake_up_webhook_svc() {

	const heroku_url = "https://okta-webhooks.herokuapp.com"

	axios.get(heroku_url)
	.then(function (response) {
		// handle success
		if (response.status == 200) {
			console.log("the heroku webhooks site is awake.")
		}
	})
	.catch(function (error) {
		// handle error
		console.log(error);
	})
	.then(function () {
		// always executed
	})
}
