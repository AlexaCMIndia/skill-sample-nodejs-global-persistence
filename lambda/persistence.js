module.exports = {
    applicationIdKeyGenerator(requestEnvelope) {
        if (requestEnvelope
            && requestEnvelope.context
            && requestEnvelope.context.System
            && requestEnvelope.context.System.application
            && requestEnvelope.context.System.application.applicationId) {
        return requestEnvelope.context.System.application.applicationId; 
        }
        throw 'Cannot retrieve app id from request envelope!';
    },
    userIdKeyGenerator(requestEnvelope) {
        if (requestEnvelope
            && requestEnvelope.context
            && requestEnvelope.context.System
            && requestEnvelope.context.System.user
            && requestEnvelope.context.System.user.userId) {
        return requestEnvelope.context.System.user.userId; 
        }
        throw 'Cannot retrieve user id from request envelope!';
    }
}

