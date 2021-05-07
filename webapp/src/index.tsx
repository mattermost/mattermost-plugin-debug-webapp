import {Store, Action} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';

import manifest from './manifest';

// eslint-disable-next-line import/no-unresolved
import {PluginRegistry} from './types/mattermost-webapp';

const globalStats = {
    Start: Date.now(),
    NumDispatches: 0,
};

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        window.webappDebugStore = store;
        store.subscribe(() => {
            globalStats.NumDispatches++;
        });
        window.logStoreStatistics = () => logStoreStatistics(store);
    }
}

function logStoreStatistics(store: any) {
    const state = store.getState();
    const now = Date.now();

    const currentChannelId = state.entities.channels.currentChannelId;
    const currentTeamId = state.entities.teams.currentTeamId;

    const statistics = {
        Users: Object.keys(state.entities.users.profiles)?.length,
        Teams: Object.keys(state.entities.teams.teams)?.length,
        'Channels (all teams)': Object.keys(state.entities.channels.channels)?.length,
        'Channels (current team)': Object.values(state.entities.channels.channels).filter((channel: any) => channel.team_id === currentTeamId)?.length,
        'Channels (DMs/GMs)': Object.values(state.entities.channels.channels).filter((channel: any) => channel.team_id === '')?.length,
        'Sidebar categories (all teams)': Object.keys(state.entities.channelCategories.byId)?.length,
        'Sidebar categories (current team)': state.entities.channelCategories.orderByTeam[currentTeamId]?.length,
        Posts: Object.keys(state.entities.posts.posts)?.length,
        'Posts (current channel)': Object.values(state.entities.posts.posts).filter((post: any) => post.channel_id === currentChannelId)?.length,
        'Visible DMs (from preferences)': Object.values(state.entities.preferences.myPreferences).filter((preference: any) => preference.category === 'direct_channel_show' && preference.value === 'true')?.length,
        'Visible GMs (from preferences)': Object.values(state.entities.preferences.myPreferences).filter((preference: any) => preference.category === 'group_channel_show' && preference.value === 'true')?.length,
        Start: globalStats.Start,
        NumDispatches: globalStats.NumDispatches,
        Now: now,
        DispatchesPerSecond: globalStats.NumDispatches / (Math.abs(now - globalStats.Start) / 1000),
    };

    // eslint-disable-next-line no-console
    console.log('Objects loaded:\n\n', JSON.stringify(statistics, null, 2));
}

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
        webappDebugStore: any;
        logStoreStatistics: any;
    }
}

window.registerPlugin(manifest.id, new Plugin());
