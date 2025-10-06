export function buildOpenAPISpec({ serverUrl }: { serverUrl: string }) {
    const spec = {
        openapi: "3.1.0",
        info: {
            title: "CMS Platform API",
            version: "1.0.0",
            description:
                "Next.js API for content, auth, media, and search. Auth via JWT bearer tokens."
        },
        servers: [{ url: serverUrl }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        email: { type: "string", format: "email" },
                        role: { type: "string", enum: ["admin", "editor", "author", "viewer"] },
                        permissions: { type: "array", items: { type: "string" } },
                        displayName: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                    required: ["id", "email", "role", "permissions"],
                },
                Article: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        slug: { type: "string" },
                        content: { type: "string" },
                        publishedAt: { type: "string", format: "date-time", nullable: true },
                    },
                    required: ["id", "title", "slug", "content"],
                },
                AuthTokens: {
                    type: "object",
                    properties: {
                        accessToken: { type: "string" },
                        refreshToken: { type: "string" },
                    },
                    required: ["accessToken", "refreshToken"],
                },
                Error: {
                    type: "object",
                    properties: { error: { type: "string" } },
                    required: ["error"],
                },
            },
        },
        security: [],
        paths: {
            "/api/content": {
                get: {
                    summary: "List articles",
                    tags: ["Content"],
                    responses: {
                        "200": {
                            description: "OK",
                            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Article" } } } }
                        }
                    }
                },
                post: {
                    summary: "Create article",
                    tags: ["Content"],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["title", "slug", "content", "authorId"],
                                    properties: {
                                        title: { type: "string" },
                                        slug: { type: "string" },
                                        content: { type: "string" },
                                        authorId: { type: "string" },
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Article" } } } },
                        "400": { description: "Bad Request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
                    }
                }
            },
            "/api/content/{id}": {
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                get: {
                    summary: "Get article by id or slug",
                    tags: ["Content"],
                    responses: {
                        "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Article" } } } },
                        "404": { description: "Not Found" }
                    }
                },
                put: {
                    summary: "Update article",
                    tags: ["Content"],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        content: { "application/json": { schema: { $ref: "#/components/schemas/Article" } } }
                    },
                    responses: { "200": { description: "OK" }, "404": { description: "Not Found" } }
                },
                delete: {
                    summary: "Delete article",
                    tags: ["Content"],
                    security: [{ bearerAuth: [] }],
                    responses: { "204": { description: "No Content" }, "404": { description: "Not Found" } }
                }
            },
            "/api/comments": {
                get: {
                    summary: "List comments by articleId",
                    tags: ["Comments"],
                    parameters: [
                        { name: "articleId", in: "query", required: true, schema: { type: "string" } }
                    ],
                    responses: { "200": { description: "OK" } }
                },
                post: {
                    summary: "Add comment",
                    tags: ["Comments"],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: {
                                    type: "object",
                                    required: ["articleId", "userId", "text"],
                                    properties: {
                                        articleId: { type: "string" },
                                        userId: { type: "string" },
                                        text: { type: "string" }
                                    }
                                }}}
                    },
                    responses: { "201": { description: "Created" } }
                }
            },
            "/api/auth/register": {
                post: {
                    summary: "Register new user",
                    tags: ["Auth"],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: {
                                    type: "object",
                                    required: ["email", "password"],
                                    properties: {
                                        email: { type: "string", format: "email" },
                                        password: { type: "string", minLength: 8 },
                                        displayName: { type: "string" }
                                    }
                                }}}
                    },
                    responses: {
                        "201": { description: "Created", content: { "application/json": { schema: {
                                        type: "object",
                                        properties: {
                                            user: { $ref: "#/components/schemas/User" },
                                            accessToken: { type: "string" },
                                            refreshToken: { type: "string" }
                                        },
                                        required: ["user", "accessToken", "refreshToken"]
                                    }}}},
                        "409": { description: "Conflict", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
                    }
                }
            },
            "/api/auth/login": {
                post: {
                    summary: "Login",
                    tags: ["Auth"],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: {
                                    type: "object",
                                    required: ["email", "password"],
                                    properties: {
                                        email: { type: "string", format: "email" },
                                        password: { type: "string" }
                                    }
                                }}}
                    },
                    responses: {
                        "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthTokens" } } } },
                        "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
                    }
                }
            },
            "/api/auth/refresh": {
                post: {
                    summary: "Refresh access token",
                    tags: ["Auth"],
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: {
                                    type: "object",
                                    required: ["refreshToken"],
                                    properties: { refreshToken: { type: "string" } }
                                }}}
                    },
                    responses: {
                        "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthTokens" } } } },
                        "401": { description: "Unauthorized" }
                    }
                }
            }
        }
    };

    return spec;
}
