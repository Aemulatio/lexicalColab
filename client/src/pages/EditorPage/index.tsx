import {$getRoot, $createParagraphNode, $createTextNode} from 'lexical';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import * as Y from 'yjs';
// import {$initialEditorState} from './initialEditorState';
import {WebsocketProvider} from 'y-websocket';
import {useCallback} from "react";

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
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="editor-input"/>}
        placeholder={<div className="editor-placeholder">Enter some rich text...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <CollaborationPlugin
        id="lexical/react-rich-collab"
        providerFactory={providerFactory}
        // Optional initial editor state in case collaborative Y.Doc won't
        // have any existing data on server. Then it'll user this value to populate editor.
        // It accepts same type of values as LexicalComposer editorState
        // prop (json string, state object, or a function)
        // initialEditorState={$initialEditorState}
        shouldBootstrap={true}
      />
    </LexicalComposer>
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
