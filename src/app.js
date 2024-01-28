import axios from 'axios'
import express from 'express'
import Seam from 'seamapi'

const app = express()

const seam = new Seam()
const { connect_webview: connectWebview } = await seam.connectWebviews.create({
    accepted_providers: ['schlage'],
})

app.post('/api/registerwebhook', async (req, res, next) => {
    const { listingMapId, channelId, isEnabled, url, login, password } = req.body

    const reqURL = `https://api.hostaway.com/v1/webhooks/reservations`
    const response = await axios.post(reqURL, { listingMapId, channelId, isEnabled, url, login, password })
    if (response.status !== 201) {
        return res.status(201).json({
            success: false,
            message: 'Something went wrong!!!'
        })
    }

    return res.status(201).json({
        success: true,
        message: 'Web hook registered successfully!!!'
    })
})

//api that will be registered to hostway api as a webhook
app.post('/api/hostway-webhook', async (req, res, next) => {
    const allLocks = await seam.locks.list()
    const someLock = allLocks[0]

    await seam.locks.lockDoor(someLock.device_id)
    const updatedLock = await seam.locks.get(someLock.device_id)
    if (updatedLock == true) {
        return res.status(200).json({
            success: true,
            message: 'Door locked successfully!!!'
        })
    }
})


module.exports = app