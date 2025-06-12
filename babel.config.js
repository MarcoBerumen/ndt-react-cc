export default {
    presets: [
      ['@babel/preset-env', { modules: false }],
      ['@babel/preset-react', { runtime: 'automatic' }]
    ],
    env: {
      test: {
        presets: [
          ['@babel/preset-env', { modules: 'auto' }],
          ['@babel/preset-react', { runtime: 'automatic' }]
        ]
      }
    }
  };