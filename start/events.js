const Event = use('Event')

Event.on('new::sendEmail', "EmailEvent.sendEmail")

Event.on('new::_sendEmail', "sendEmailEvent.sendEmail")



