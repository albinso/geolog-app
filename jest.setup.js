jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
process.env.REACT_APP_SECRET_KEY='8cFFew-OdUV2lCWt-rgCSNdWd5kbJ0jcYJT0Kh8FkccCAzFuH0beTQ==';