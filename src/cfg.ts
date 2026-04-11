import ms from 'ms'

export const cfg = {
  debug: false,

  defaultValue: {
    limit: 10,
    page: 1,
  },

  channel: {
    limit: 20,
    pollInterval: ms('60s')
  },

  video: {
    limit: 50,
    pollInterval: ms('60s')
  },

  superchat: {
    limit: 500,
    pollInterval: ms('30s')
  },

  author: {
    chat: {
      limit: 100,
      pollInterval: ms('60s')
    }
  },
}
