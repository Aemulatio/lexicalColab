import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import * as Y from 'yjs';
// import {$initialEditorState} from './initialEditorState';
import {messageAwareness, WebsocketProvider} from 'y-websocket';
import {useCallback, useEffect, useState} from "react";
import {Provider} from '@lexical/yjs';
import {WebrtcProvider} from 'y-webrtc';

import s from './Editor.module.css'

export const EditorPage = () => {
  const [userProfile, setUserProfile] = useState(() => getRandomUserProfile());


  const initialConfig = {
    // NOTE: This is critical for collaboration plugin to set editor state to null. It
    // would indicate that the editor should not try to set any default state
    // (not even empty one), and let collaboration plugin do it instead
    editorState: null,
    namespace: 'Demo',
    nodes: [],
    onError: (error: Error) => {
      throw error;
    },
    theme: {},
  };

  const providerName = '-webrtc';

  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>) => {
      const provider =
        providerName === 'webrtc'
          ? createWebRTCProvider(id, yjsDocMap)
          : createWebsocketProvider(id, yjsDocMap);

      provider.on('status', (event) => {
        console.log("event: ", event);
      });


      return provider
    }, [],
  );

  useEffect(() => {
    (function (postMessage) {
      BroadcastChannel.prototype.postMessage = function (message) {
        // debugger;
        console.log("message: ", message)
        postMessage.call(this, message);
      };
    }(BroadcastChannel.prototype.postMessage));
  }, [])

  return (
    <main className={s.root}>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable className={s.editor}/>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <CollaborationPlugin
          id="collab"
          providerFactory={providerFactory}
          // Optional initial editor state in case collaborative Y.Doc won't
          // have any existing data on server. Then it'll user this value to populate editor.
          // It accepts same type of values as LexicalComposer editorState
          // prop (json string, state object, or a function)
          // initialEditorState={$initialEditorState}
          shouldBootstrap={true}
          username={userProfile.name}
          cursorColor={userProfile.color}
        />
      </LexicalComposer>
    </main>
  );
}


function getDocFromMap(id: string, yjsDocMap: Map<string, Y.Doc>): Y.Doc {
  let doc = yjsDocMap.get(id);

  if (doc === undefined) {
    doc = new Y.Doc();
    yjsDocMap.set(id, doc);
  } else {
    doc.load();
  }

  return doc;
}


const WEBSOCKET_ENDPOINT = `ws://${import.meta.env.APP_SERVER_HOST}:${import.meta.env.APP_SERVER_PORT}`

function createWebsocketProvider(
  id: string,
  yjsDocMap: Map<string, Y.Doc>,
): Provider {
  const doc = getDocFromMap(id, yjsDocMap);

  // @ts-expect-error
  return new WebsocketProvider(
    WEBSOCKET_ENDPOINT,
    id,
    doc,
    {
      connect: false,
    },
  );
}


let idSuffix = 0; // In React Strict mode "new WebrtcProvider" may be called twice

const createWebRTCProvider = (id: string,
                              yjsDocMap: Map<string, Y.Doc>,): Provider => {
  const doc = getDocFromMap(id, yjsDocMap);

  // localStorage.log = 'true' in browser console to enable logging
  // @ts-ignore
  return new WebrtcProvider(`${id}/${idSuffix++}`, doc, {
    peerOpts: {
      reconnectTimer: 100,
    },
    // awareness: messageAwareness,
    filterBcConns: true,
    signaling:
      window.location.hostname === 'localhost' ? [`${WEBSOCKET_ENDPOINT}/collab`] : [],
  });
}



const entries: [string, string][] = [
  ['Arabian', '#7d0000'],
  ['Appaloosa', '#640000'],
  ['Friesian', '#990000'],
  ['Thoroughbred', '#bf0000'],
  ['Warmblood', '#bf4000'],
  ['Saddlebred', '#004000'],
  ['Mustang', '#007f00'],
  ['Trakehner', '#407f00'],
  ['Quarter Horse', '#7f7f00'],
  ['Clydesdale', '#000099'],
  ['Paint', '#0000bf'],
  ['Icelandic', '#0000ff'],
  ['Andalusian', '#004040'],
  ['Tennessee Walker', '#404040'],
  ['Ukrainian Riding Horse', '#7f0040'],
  ['Percheron', '#bf0040'],
];

export interface UserProfile {
  name: string;
  color: string;
}

export function getRandomUserProfile(): UserProfile {
  const entry = entries[Math.floor(Math.random() * entries.length)];
  return {
    color: entry[1],
    name: entry[0],
  };
}
