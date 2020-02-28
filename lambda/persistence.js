const adapterLibraryS3 = require('ask-sdk-s3-persistence-adapter');
const adapterLibraryDynamoDB = require('ask-sdk-dynamodb-persistence-adapter');
const DYNAMO_DB_TABLE_NAME = 'data';

module.exports = {
    getPersistenceAdapter(global) {
        // This function is an indirect way to detect if this is an Alexa-Hosted skill
        function isAlexaHosted() {
            return !!process.env.S3_PERSISTENCE_BUCKET;
        }
    
        // This function establishes the primary key of the database as the skill id (hence you get global persistence, not per user id)
        function appIdKeyGenerator(requestEnvelope) {
            if (requestEnvelope
                && requestEnvelope.context
                && requestEnvelope.context.System
                && requestEnvelope.context.System.application
                && requestEnvelope.context.System.application.applicationId) {
            return requestEnvelope.context.System.application.applicationId; 
            }
            throw 'Cannot retrieve app id from request envelope!';
        }
    
        let persistenceAdapter;
    
        if (isAlexaHosted()) {
            const { S3PersistenceAdapter, ObjectKeyGenerators } = adapterLibraryS3;
            persistenceAdapter = global ? new S3PersistenceAdapter({
                bucketName: process.env.S3_PERSISTENCE_BUCKET,
                objectKeyGenerator: appIdKeyGenerator
            }) : new S3PersistenceAdapter({
                bucketName: process.env.S3_PERSISTENCE_BUCKET,
                objectKeyGenerator: ObjectKeyGenerators.userId
            });
        } else {
            // IMPORTANT: don't forget to give DynamoDB access to the role you're to run this lambda (IAM)
            const { DynamoDbPersistenceAdapter, PartitionKeyGenerators } = adapterLibraryDynamoDB;
            persistenceAdapter = global ? new DynamoDbPersistenceAdapter({
                tableName: DYNAMO_DB_TABLE_NAME,
                createTable: true,
                partitionKeyGenerator: appIdKeyGenerator
            }) : new DynamoDbPersistenceAdapter({
                tableName: DYNAMO_DB_TABLE_NAME,
                createTable: true,
                partitionKeyGenerator: PartitionKeyGenerators.userId
            });
        }
        return persistenceAdapter;
    }
}

