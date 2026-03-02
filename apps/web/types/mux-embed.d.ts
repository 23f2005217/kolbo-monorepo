declare module "mux-embed" {
  export interface MuxEmbedElement {
    destroy: () => void;
  }

  export interface MuxOptions {
    debug?: boolean;
    disableCookies?: boolean;
    respectDoNotTrack?: boolean;
    automaticErrorTracking?: boolean;
    errorTranslator?: (error: any) => any;
    beaconCollectionDomain?: string;
    data: {
      env_key: string;
      player_name?: string;
      player_version?: string;
      player_init_time?: number;
      video_id?: string;
      video_title?: string;
      video_series?: string;
      video_duration?: number;
      video_stream_type?: "live" | "on-demand";
      video_cdn?: string;
      viewer_user_id?: string;
      experiment_name?: string;
      sub_property_id?: string;
    };
  }

  const mux: {
    monitor: (element: HTMLElement | string, options: MuxOptions) => void;
    emit: (element: HTMLElement | string, event: string, data?: any) => void;
    updateData: (data: any) => void;
    utils: {
      now: () => number;
    };
    events: {
      PLAY: string;
      PAUSE: string;
      ENDED: string;
    };
  };

  export default mux;
}
