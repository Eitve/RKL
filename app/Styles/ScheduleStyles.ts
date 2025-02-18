import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  switch: {
    marginHorizontal: 10,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    padding: 10,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
});
