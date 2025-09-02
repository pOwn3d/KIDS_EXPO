import React from 'react';

const createMockComponent = (name) => {
  const MockComponent = React.forwardRef((props, ref) => 
    React.createElement('View', { ...props, ref, testID: props.testID || name })
  );
  MockComponent.displayName = name;
  return MockComponent;
};

export const Ionicons = createMockComponent('Ionicons');
export const MaterialIcons = createMockComponent('MaterialIcons');
export const FontAwesome = createMockComponent('FontAwesome');
export const Feather = createMockComponent('Feather');
export const AntDesign = createMockComponent('AntDesign');

export default {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
  AntDesign,
};