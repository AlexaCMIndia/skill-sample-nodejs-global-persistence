/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const interceptors = require('./interceptors');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const attributes = attributesManager.getSessionAttributes();
        const globalAttributes = attributes['global'];
        const launchCount = globalAttributes['launchCount'] || 0;

        const speechText = `Welcome to the <say-as interpret-as="ordinal">` + launchCount + '</say-as> global launch of global persistence demo. You can tell me a key value pair, with a four digit key and a country as value. For example you can say, assign Australia to <say-as interpret-as="digits">1234</say-as>. You can also just say, register pair, get value or delete key';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};

const GetAttributeIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetAttributeIntent';
    },
    handle(handlerInput) {
        const { attributesManager, requestEnvelope } = handlerInput;
        const { request } = requestEnvelope;
        const intent = request.intent;

        let key = Alexa.getSlotValue(requestEnvelope, 'key');
        key = key ? key.padStart(4, '0') : null;

        let speechText;
        const attributes = attributesManager.getSessionAttributes();
        if (key && attributes['local'][key]) {
            const value = attributes['local'][key];
            speechText = 'The value assigned to <say-as interpret-as="digits">' + key + '</say-as> is ' + value + '.';
        } else {
            speechText = 'Sorry, there\'s no value assigned to that key yet.';
        }

        return handlerInput.responseBuilder
            .speak(speechText + ' You can now continue querying, deleting or registering key value pairs')
            .reprompt('you can say, find value, or, assign value to key, where key is a four digit number sequence and value is a valid country')
            .getResponse();

    }
}

const SetAttributeIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SetAttributeIntent';
    },
    handle(handlerInput) {
        const { attributesManager, requestEnvelope } = handlerInput;
        const { request } = requestEnvelope;
        const intent = request.intent;

        let key = Alexa.getSlotValue(requestEnvelope, 'key');
        key = key ? key.padStart(4, '0') : null;
        const value = Alexa.getSlotValue(requestEnvelope, 'value');

        let speechText;
        if (key && value && intent.confirmationStatus !== 'DENIED') {
            let attributes = attributesManager.getSessionAttributes();
            attributes['local'][key] = value;
            attributesManager.setSessionAttributes(attributes);
            speechText = 'Key value pair <say-as interpret-as="digits">' + key + '</say-as> ' + value + ', registered and will be saved on exit.';
        } else {
            speechText = 'Ok. I won\'t register this pair.';
        }

        return handlerInput.responseBuilder
            .speak(speechText + ' You can now continue querying, deleting or registering key value pairs')
            .reprompt('you can say, find key, or assign value to key, where key is a four digit number sequence and value is a valid country')
            .getResponse();
    }
};

const DeleteAttributeIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'DeleteAttributeIntent';
    },
    handle(handlerInput) {
        const { attributesManager, requestEnvelope } = handlerInput;
        const { request } = requestEnvelope;
        const intent = request.intent;

        let key = Alexa.getSlotValue(requestEnvelope, 'key');
        key = key ? key.padStart(4, '0') : null;

        let speechText;
        let attributes = attributesManager.getSessionAttributes();
        if (key && attributes['local'][key] && intent.confirmationStatus !== 'DENIED') {
            delete attributes['local'][key];
            attributesManager.setSessionAttributes(attributes);
            speechText = 'Key value pair <say-as interpret-as="digits">' + key + '</say-as> has been deleted and the new status will be saved on exit.';
        } else {
            if (intent.confirmationStatus === 'DENIED')
                speechText = 'Ok, let\'s cancel that. You can now continue querying, registering or deleting key value pairs';
            else
                speechText = 'I can\'t find an a pair for that key. Please try again saying, for example, delete <say-as interpret-as="digits">1234</say-as>';
        }

        return handlerInput.responseBuilder
            .speak(speechText + ' You can now continue querying, registering or deleting key value pairs')
            .reprompt('you can say, find value, delete key or, assign value to key, where key is a four digit number sequence and value is a valid country')
            .getResponse();
    }
}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can tell me a key value pair, with a four digit key and a country as value. For example you can say, assign Australia to <say-as interpret-as="digits">1234</say-as>. Or you can just say register pair, get value or delete key';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    },
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speechText = 'I don\'t know that! Please try again or say help';

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error}`);

        return handlerInput.responseBuilder
            .speak('Sorry,there was an error. Please say again.')
            .reprompt('Sorry, there was an error. Please say again.')
            .getResponse();
    },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        GetAttributeIntentHandler,
        SetAttributeIntentHandler,
        DeleteAttributeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(interceptors.LoadRequestInterceptor)
    .addResponseInterceptors(interceptors.SaveResponseInterceptor)
    .lambda();
