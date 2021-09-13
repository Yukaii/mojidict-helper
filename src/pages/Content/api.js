import Channel from '../../lib/channel'

const channel = new Channel('mojidict-api')

export const search = (searchText) => channel.send('search', { searchText })
export const fetchWord = (wordId) => channel.send('fetchWord', { wordId })
