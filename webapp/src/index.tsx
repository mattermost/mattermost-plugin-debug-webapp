import {Store, Action} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';

import manifest from './manifest';

// eslint-disable-next-line import/no-unresolved
import {PluginRegistry} from './types/mattermost-webapp';

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        window.store = store;
        window.logStoreStatistics = () => logStoreStatistics(store);
    }
}

function logStoreStatistics(store) {
    const state = store.getState();

    const currentChannelId = state.entities.channels.currentChannelId;
    const currentTeamId = state.entities.teams.currentTeamId;

    const statistics = {
        'Users': Object.keys(state.entities.users.profiles).length,
        'Teams': Object.keys(state.entities.teams.teams).length,
        'Channels (all teams)': Object.keys(state.entities.channels.channels).length,
        'Channels (current team)': Object.values(state.entities.channels.channels).filter((channel) => channel.team_id === currentTeamId).length,
        'Channels (DMs/GMs)': Object.values(state.entities.channels.channels).filter((channel) => channel.team_id === '').length,
        'Sidebar categories (all teams)': Object.keys(state.entities.channelCategories.byId).length,
        'Sidebar categories (current team)': state.entities.channelCategories.orderByTeam[currentTeamId].length,
        'Posts': Object.keys(state.entities.posts.posts).length,
        'Posts (current channel)': Object.values(state.entities.posts.posts).filter((post) => post.channel_id === currentChannelId).length,
        'Visible DMs (from preferences)': Object.values(state.entities.preferences.myPreferences).filter((preference) => preference.category === 'direct_channel_show' && preference.value === 'true').length,
        'Visible GMs (from preferences)': Object.values(state.entities.preferences.myPreferences).filter((preference) => preference.category === 'group_channel_show' && preference.value === 'true').length,
    };

    console.log('Objects loaded:', statistics);
}


declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
        store: any;
        logStoreStatistics: any;
    }
}

window.registerPlugin(manifest.id, new Plugin());
