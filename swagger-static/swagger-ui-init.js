
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/api/v1/auth/registration": {
        "post": {
          "operationId": "AuthController_registration",
          "summary": "Registration in the system. Email with confirmation code will be send to passed email address",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegistrationUserModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Input data is accepted. Email with confirmation code will be send to passed email address"
            },
            "400": {
              "description": "If the inputModel has incorrect values (in particular if the user with the given email or login already exists)",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/registration-confirmation": {
        "get": {
          "operationId": "AuthController_confirmRegistration",
          "summary": "Confirm Registration",
          "description": "This endpoint is used to confirm email ownership and automatically redirect the user to the login page.",
          "parameters": [
            {
              "name": "code",
              "required": true,
              "in": "query",
              "description": "Code that be sent via Email inside link",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Email was verified. Account was activated"
            },
            "400": {
              "description": "If the confirmation code is incorrect, expired or already been applied",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/resend-code": {
        "post": {
          "operationId": "AuthController_resendCode",
          "summary": "Resend confirmation registration Email if user exists",
          "parameters": [
            {
              "name": "code",
              "required": true,
              "in": "query",
              "description": "Code that will be emailed inside the link",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Input data is accepted.Email with confirmation code will be send to passed email address"
            },
            "400": {
              "description": "If the confirmation code is incorrect, expired or already been applied",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/password-recovery": {
        "post": {
          "operationId": "AuthController_passwordRecovery",
          "summary": "Password recovery via Email confirmation. Email should be sent with RecoveryCode inside",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PasswordRecoveryModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Even if current email is not registered (for prevent user's email detection)"
            },
            "400": {
              "description": "If the inputModel has invalid email (for example 222^gmail.com)",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/confirm-password-recovery": {
        "get": {
          "operationId": "AuthController_confirmPasswordRecovery",
          "summary": "Confirm recovery password",
          "description": "This endpoint is used to confirm email ownership and automatically redirect the user to input new password page.",
          "parameters": [
            {
              "name": "code",
              "required": true,
              "in": "query",
              "description": "Recovery code that be sent via Email inside link",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Email was verified."
            },
            "400": {
              "description": "If the recovery code is incorrect, expired or already been used",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/new-password": {
        "post": {
          "operationId": "AuthController_confirmRecoveryPassword",
          "summary": "New password",
          "description": "This endpoint is used to set a new password",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePasswordModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "If code is valid and new password is accepted"
            },
            "400": {
              "description": "If the inputModel has incorrect values(recovery code is incorrect, expired or not confirmed or password incorrect)",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/login": {
        "post": {
          "operationId": "AuthController_login",
          "summary": "Try login user to the system",
          "parameters": [
            {
              "name": "user-agent",
              "required": true,
              "in": "header",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginModel"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns JWT accessToken (expired after 30 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 200 minutes).",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string",
                    "example": {
                      "accessToken": "string"
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "If the password or login is wrong"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/refresh-token": {
        "post": {
          "operationId": "AuthController_refreshSession",
          "summary": "Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Returns new pair: JWT accessToken (expired after 30 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 200 minutes).",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string",
                    "example": {
                      "accessToken": "string"
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If the refreshToken has incorrect or expired",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/me": {
        "get": {
          "operationId": "AuthController_me",
          "summary": "Get information about current user",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ViewUserModel"
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Auth"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/v1/auth/logout": {
        "post": {
          "operationId": "AuthController_logout",
          "summary": "In cookie client must send correct refreshToken that will be revoked",
          "parameters": [],
          "responses": {
            "204": {
              "description": "No Content"
            },
            "400": {
              "description": "If the JWT refreshToken inside cookie is missing, expired or incorrect",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      }
    },
    "info": {
      "title": "Inctagram(Flying Merch)",
      "description": "",
      "version": "1.0",
      "contact": {}
    },
    "tags": [
      {
        "name": "Auth",
        "description": ""
      }
    ],
    "servers": [],
    "components": {
      "schemas": {
        "RegistrationUserModel": {
          "type": "object",
          "properties": {
            "login": {
              "type": "string",
              "minimum": 6,
              "maximum": 30,
              "pattern": "^[a-zA-Z0-9_-]*$"
            },
            "email": {
              "type": "string",
              "pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$\n"
            },
            "password": {
              "type": "string",
              "minimum": 6,
              "maximum": 20
            }
          },
          "required": [
            "login",
            "email",
            "password"
          ]
        },
        "PasswordRecoveryModel": {
          "type": "object",
          "properties": {}
        },
        "UpdatePasswordModel": {
          "type": "object",
          "properties": {
            "newPassword": {
              "type": "string",
              "minimum": 6,
              "maximum": 20,
              "pattern": "^[a-zA-Z0-9_-]*$"
            },
            "recoveryCode": {
              "type": "string"
            }
          },
          "required": [
            "newPassword",
            "recoveryCode"
          ]
        },
        "LoginModel": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string"
            },
            "password": {
              "type": "string"
            }
          },
          "required": [
            "email",
            "password"
          ]
        },
        "ViewUserModel": {
          "type": "object",
          "properties": {
            "login": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "userId": {
              "type": "number"
            }
          },
          "required": [
            "login",
            "email",
            "userId"
          ]
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}