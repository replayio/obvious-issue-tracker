/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** FullStory org id for Replay QA session capture. Set only in .env.production. */
  readonly VITE_FULLSTORY_ORG_ID?: string;
}
