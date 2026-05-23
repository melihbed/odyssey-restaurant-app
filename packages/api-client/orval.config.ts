import { defineConfig } from 'orval'

export default defineConfig({
  restaurant: {
    input: {
      target: '../../services/backend/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/generated',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/mutator.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
      prettier: true,
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
})
