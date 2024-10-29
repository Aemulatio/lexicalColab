import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import * as Y from 'yjs';
// import {$initialEditorState} from './initialEditorState';
import {WebsocketProvider} from 'y-websocket';
import {useCallback} from "react";
import {Provider} from '@lexical/yjs';
import {WebrtcProvider} from 'y-webrtc';

import s from './Editor.module.css'

export const EditorPage = () => {

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

  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>) => {
      const doc = getDocFromMap(id, yjsDocMap);

      return new WebsocketProvider(`ws://${import.meta.env.APP_SERVER_HOST}:${import.meta.env.APP_SERVER_PORT}`, id, doc, {
        connect: false,
      });
    }, [],
  );

  return (
    <main className={s.root}>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable className={s.editor}/>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <CollaborationPlugin
          id="collab"
          providerFactory={createWebRTCProvider}
          // Optional initial editor state in case collaborative Y.Doc won't
          // have any existing data on server. Then it'll user this value to populate editor.
          // It accepts same type of values as LexicalComposer editorState
          // prop (json string, state object, or a function)
          // initialEditorState={$initialEditorState}
          shouldBootstrap={true}
          username={"test"}
          cursorColor={"red"}
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
  let doc = yjsDocMap.get(id);

  if (doc === undefined) {
    doc = new Y.Doc();
    yjsDocMap.set(id, doc);
  } else {
    doc.load();
  }

  console.log("doc: ", doc)

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

    signaling:
      window.location.hostname === 'localhost' ? [`${WEBSOCKET_ENDPOINT}/collab`] : [`${WEBSOCKET_ENDPOINT}/collab`],
  });
}
