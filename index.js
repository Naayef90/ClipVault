import 'react-native-gesture-handler';
import './src/widget/widgetTaskHandler';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { registerRootComponent } from 'expo';
import { registerWidgetConfigurationScreen } from 'react-native-android-widget';
import { SnippetWidget } from './src/widget/SnippetWidget';
import { readWidgetCache } from './src/storage/widgetCache';
import { parseSnippetArray } from './src/utils/validation';
import App from './App';

function WidgetConfigScreen({ renderWidget, setResult }) {
  useEffect(() => {
    const snippets = parseSnippetArray(readWidgetCache());
    renderWidget(<SnippetWidget snippets={snippets} />);
    setResult('ok');
  }, []);
  return <View />;
}

registerWidgetConfigurationScreen(WidgetConfigScreen);

registerRootComponent(App);
