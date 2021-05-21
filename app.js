////////////////////////////////////////////////////

require('dotenv').config()

const express = require('express')

const mustacheExpress = require('mustache-express')

// const request = require('request')

// const session = require('express-session')

// for session management

// const DynamoDBStore = require('connect-dynamodb')(session)

///////////////////////////////////////////////////

const config = require("./config.json")

// const config_files = require("./config/config_files.json")

const utils = require('./utils/utils.js')

const default_demo_name = 'default'

const default_web_home = '/' + default_demo_name

const default_fs_dir = process.env.DEMO_FS_HOME + '/public' + default_web_home

process.env.default_fs_dir = default_fs_dir
process.env.default_web_home = default_web_home

const default_username = "lois.lane"

process.env.default_username = default_username

///////////////////////////////////////////////////

const app = express()

var port = process.env.PORT || 3000

app.use(express.static('public'))

app.use(express.urlencoded({extended: true}))

app.use(express.json())

app.engine('html', mustacheExpress())

app.set('view engine', 'html')

var app_session_config = {
	secret: process.env.session_secret,
	resave: false,
	saveUninitialized: true
}

// if (process.env.hasOwnProperty("session_store") && process.env.session_store == "dynamodb") {
// 	app_session_config.store = new DynamoDBStore()
// }

// app.use(session(app_session_config))

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

		// settings[flow_name] = true

		settings["flow_name"] = flow_name

		if ("widget_config" in settings) {

			const redirect_uri = process.env.REDIRECT_URI_BASE + "/" + flow_name

			settings["widget_config"]["redirectUri"] = redirect_uri

			if ("features" in settings.widget_config && 
				"idpDiscovery" in settings.widget_config.features &&
				settings.widget_config.features) {
				settings.widget_config.idpDiscovery = {
					"requestContext": redirect_uri
				}

				settings.external_idp_logout_uri = settings.external_idp_logout_uri.replace("{{{redirect_uri}}}", redirect_uri)
			}

			if ("logout_uri" in settings) {
				settings.logout_uri = settings.logout_uri.replace("{{{redirect_uri}}}", redirect_uri)
			}


			settings["redirect_uri"] = redirect_uri

			if (typeof(settings["widget_config"]) == "object") {
				settings["widget_config"] = JSON.stringify(settings["widget_config"], null, 2)
			}
		}
		
		console.dir(settings)

		res.render('index', settings)

		resolve(true)
	})	
}

function wake_up_webhook_svc() {
	
}
