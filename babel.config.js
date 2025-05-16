module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',    // <– חובה!
      // כל שאר ה־plugins שלך, למשל expo-font
    ],
  };
};
