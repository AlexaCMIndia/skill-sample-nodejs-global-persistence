# Global scope Persistence in Alexa Skills passing a Key Generator to a Persistence Adapter
<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/fact/header._TTH_.png" />

By default our DynamoDB and S3 persistence adapters use the userId as primary key for storage. Because of this, all stored attributes have local scope (user scope). In this example we show how to ocassionally pass a key generator function to the adapter that returns the applicationId (aka skillId) as primary key so some sttributes are stored in global (skill) scope.
In this example specifically we store key/value pairs in local (user) scope and the number of times the skill was launched in global (skill) scope. Users will not be able to share key/value pair data but they will share the skill launch count.

Supports both the DynamoDB and the S3 persistence adapters (switching dinamycally to the later if an Alexa Hosted Skill is detected). If you use the DynamoDB adapter don't forget to add permissions to access it in the Lambda's role. It's normal to get an error the first time you launch the skill if you're auto-creating the DynamoDB table on launch.

## What's covered
1. Passing a Key Generator function to a Persistencve Adapter