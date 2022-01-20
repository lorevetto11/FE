# Installation steps

1. `npm install`
2. `bower install`

## Serve

1. `grunt serve`
> To use local or remote services you can modify ngconstant.development.constants.ENV.hostEndpoint in Gruntfile.js

## Build

1. `grunt` || `grunt build`
2. `grunt war`

### Translations management

Procedure to add a new language:
1. Add a new translations file in `\app\language` and name it following the current format (ex: locale_[IETF Language Tag](https://en.wikipedia.org/wiki/IETF_language_tag#Syntax_of_language_tags).json)
2. Add the new language option in the translation files
```json
{  
  "lang": {
    "it-IT": "Italian",
    "en-US": "English",
    "te-TE": "Test",
  },
}
```
3. Add the following `<option>` tag in `app\views\user\home\user.home.html`
```html
<option label="{{'lang.te-TE'|translate}}" value="te-TE">
    {{'lang.te-TE'|translate}} - TEST
</option>
```

Procedure to change the default user language:
1. You can change the default language modifying the ngconstant.development.constants.ENV.language property in Gruntfile.js

> The language can be modified in the people management panel > user.
> The language is set as a post login action so you won't see any change until you re-login into the application. // FYI: login.js controller

