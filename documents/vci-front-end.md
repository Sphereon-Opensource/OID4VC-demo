## Overview
This module creates a UI using react. To create a custom UI, you should add your own configuration to `packages/oid4vci-demo-frontend/src/configs` folder. You can take a look at our other existing configurations before doing so, or if you want a more in-depth understanding about all the values inside these config files, you might want to take a look at the interfaces behind this [configuration] (packages/oid4vci-demo-frontend/src/ecosystem/ecosystem-config.ts)

## Config
For configuring your VCI front end you have to create your own file in `packages/oid4vci-demo-frontend/src/configs` here are a few important note on these configurations:
- We're supporting a wide range of options that are not necessarily used in all of our config samples. If you have a special case, be sure to read the interfaces behind the config.
- It's necessary to populate the form in `infoRequest` page.
- You can modify your flow to choose what suits your purpose. this can be achieved with modifying the `routes` property in your config json.
- If your config contains new images, be sure to copy them in the public folder of this module

### Form configuration
Here is a more in-depth look at the form configuration. A form is a list of lists. This is done to enable you to have multiple entries in a line.
Each input entry can be defined with the following interface:
```ts
export interface DataFormElement {
    id: string
    key: string
    type: HTMLInputTypeAttribute
    required?: boolean
    readonlyWhenAbsentInPayload?: boolean
    defaultValue?: FormFieldValue
    label?: string
    labelUrl?: string
    readonly?: boolean
    customValidation?: string
    display?: {
        checkboxBorderColor?: string
        checkboxLabelColor?: string
        checkboxSelectedColor?: string
    }
}
```

This form will be (partially) filled in with the vp_token that the agent receives from your wallet. Here is an explainer about some of the most important part of this interface:
- `id`:
  In order to make it known which field is related to which entry in `credentialSubject` we look at `id` of the field.
- `type`:
  For now a form entry, supports three types: `checkbox`, `text` and `date`.
- `customValidation`:
  If you want to have a custom validation on your input, you can provide a **regex** to `customValidation` field.
- `label`:
  You can set the label of your field. This is a translation key for the form. You can view them in `packages/oid4vci-demo-frontend/public/locales`
- `readonly`:
  If you wish that this input element be readonly you can assign true to this property
- `required`:
  If you wish make this a necessary field, you can assign true to this property. In case of empty value for this form element, The button at the end of the form will stay disable.
- `readonlyWhenAbsentInPayload`:
  If this element is only required if you're receiving it in your vp_token and otherwise should stay empty, you can assign true to this property.

####_**IMPORTANT NOTE**_
As mentioned we're partially filling in the form data from received vp_token. Make sure that you are configuring your form based on the value that is present in your `credentialSubject`. Only values that exist in your form (`id` property of a `DataFormElement`) will show up.
Here is an example of a `credentialSubject` that can be used for populating this form:

```json
{
...,
    "credentialSubject": {
      "firstName": "John",
      "lastName": "Smith",
      "emailAddress": "john.smith@email-provider.com",
      "id": "did:jwk:eyJhbGciOiJFUzI1NksiLCJ1c2UiOiJzaWciLCJrdHkiOiJFQyIsImNydiI6InNlY3AyNTZrMSIsIngiOiI3S2hEbmRTZEtGVGlzTy1BNXhwWno1SkVvYkJ2NVdELTAxWmVUbVJ0ZmdvIiwieSI6IjVFR3kyZlZPX1JKZzdsdjUwUDRuRjJ0ZklqakhsNERWOGtDQm1kdHZaQ0UifQ"
    }
  },
...
}
```
### Starting the VCI frontend
Once you've managed to create your own configuration file, you can start you have to alter the value of `REACT_APP_DEFAULT_ECOSYSTEM` in your `.env` file. After this, you can start this module using `start:prod` or `start:dev` scripts.
