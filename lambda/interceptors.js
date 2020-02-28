const persistence = require('./persistence');

// This request interceptor with each new session loads all global persistent attributes
// into the session attributes and increments a launch counter
const LoadRequestInterceptor = {
    async process(handlerInput) {
        if (handlerInput.requestEnvelope.session['new']) {
            const globalPersistenceAdapter = persistence.getPersistenceAdapter(true);
            const localPersistenceAdapter = persistence.getPersistenceAdapter();
            let globalAttributes = await globalPersistenceAdapter.getAttributes(handlerInput.requestEnvelope);
            globalAttributes = globalAttributes || {};
            console.log('Loaded global attributes: ' + JSON.stringify(globalAttributes));
            let localAttributes = await localPersistenceAdapter.getAttributes(handlerInput.requestEnvelope);
            console.log('Loaded local attributes: ' + JSON.stringify(localAttributes));
            localAttributes = localAttributes || {};
            if (!globalAttributes['launchCount'])
                globalAttributes['launchCount'] = 0;
            globalAttributes['launchCount'] += 1;
            const sessionAttributes = {'local': localAttributes, 'global': globalAttributes};
            console.log('Setting session attributes: ' + JSON.stringify(sessionAttributes));
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        }
    }
};

// This response interceptor stores all session attributes into global persistent attributes
// when the session ends and it stores the skill last used timestamp
const SaveResponseInterceptor = {
    async process(handlerInput, responseOutput) {
        const ses = (typeof responseOutput.shouldEndSession === "undefined" ? true : responseOutput.shouldEndSession);
        if (ses || handlerInput.requestEnvelope.request.type === 'SessionEndedRequest') { // skill was stopped or timed out 
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            //sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime();
            const localAttributes = sessionAttributes['local'];
            console.log('Saving local attributes: ' + JSON.stringify(localAttributes));
            const globalAttributes = sessionAttributes['global'];
            console.log('Saving global attributes: ' + JSON.stringify(globalAttributes));
            const globalPersistenceAdapter = persistence.getPersistenceAdapter(true);
            const localPersistenceAdapter = persistence.getPersistenceAdapter();
            await globalPersistenceAdapter.saveAttributes(handlerInput.requestEnvelope, globalAttributes);
            await localPersistenceAdapter.saveAttributes(handlerInput.requestEnvelope, localAttributes);
        }
    }
};

module.exports = {
    LoadRequestInterceptor,
    SaveResponseInterceptor
}