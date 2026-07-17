# System Overview

High-level view of how the browser, frontend, backend, database, and external services connect in **Wordwalker**.

## Architecture diagram

```mermaid
flowchart TB
    subgraph Client["User Browser"]
        UI["React SPA<br/>MUI + React Router"]
        LS["localStorage<br/>JWT token"]
        CTX["AuthContext<br/>Client auth state"]
        RQ["TanStack Query<br/>Server state cache"]
        UI --> CTX
        UI --> RQ
        CTX --> LS
    end

    subgraph Frontend["Frontend (port 3000)"]
        Pages["Pages / Components"]
        Hooks["hooks/<br/>usePosts / usePost / useComments..."]
        Services["services/<br/>posts / comments / auth / ai..."]
        HTTP["config/httpClient.js<br/>Axios + auth interceptor"]
        API_CFG["config/api.js<br/>API_ENDPOINTS"]
        Pages --> Hooks
        Hooks --> Services
        Services --> HTTP
        HTTP --> API_CFG
    end

    subgraph Backend["Backend Express (port 5000)"]
        APP["app.js<br/>CORS + JSON + Routes"]
        MW["middleware/auth.js<br/>JWT verify + isAdmin"]
        ROUTES["Routes"]
        MODELS["Mongoose Models"]
        INIT["scripts/initData.js"]
        APP --> MW
        APP --> ROUTES
        ROUTES --> MODELS
        APP --> INIT
    end

    subgraph DB["Database"]
        MONGO[("MongoDB<br/>User / Post / Comment / Subscriber")]
    end

    subgraph External["External Services"]
        OPENAI["OpenAI DALL-E API"]
        IMGUR["Imgur API"]
    end

    HTTP -->|"Bearer Token (interceptor)"| APP
    ROUTES --> MONGO
    ROUTES -->|"AI image gen"| OPENAI
    ROUTES -->|"Image upload"| IMGUR
    INIT --> MONGO
```

## Layers

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| **Client** | React SPA + AuthContext + TanStack Query + localStorage | UI, routing, auth state, server-state cache |
| **Frontend** | MUI, hooks, services, `httpClient`, `config/api.js` | Components call hooks → services → shared Axios instance (JWT attached automatically) |
| **Backend** | Express, Mongoose, JWT middleware | REST API, authorization, business logic, API secrets |
| **Database** | MongoDB | Users, posts, comments, subscribers |
| **External** | OpenAI + Imgur | AI cover images; stable public image URLs on posts |

## Request flow examples

### Login

```
Browser → authService.loginRequest → POST /api/auth/login → JWT → localStorage + AuthContext
(subsequent API calls: httpClient interceptor reads token from localStorage)
```

### Read a post

```
PostDetail → usePost(id) → postsService.getPost → httpClient → GET /api/posts/:id → MongoDB → TanStack Query cache
```

### Create post with AI image (authenticated)

```
PostForm → useGeneratePostImage → aiService → POST /api/ai/generate-image → OpenAI → Imgur → imageUrl
Posts / UserPosts → useCreatePost → postsService → POST /api/posts { title, content, imageUrl } → MongoDB
(query invalidation refreshes posts list / detail / my-posts caches)
```

## Security note

The browser **never** talks to MongoDB or external APIs (OpenAI, Imgur) directly. Only the Express server does, keeping credentials on the server. JWT is attached by `httpClient`'s request interceptor, not wired manually in each component.

## Related pages

- [Frontend Architecture](Frontend-Architecture.md)
- [Backend Architecture](Backend-Architecture.md)
