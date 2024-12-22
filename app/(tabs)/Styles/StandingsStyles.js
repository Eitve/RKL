import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#000',
  },
  divisionButton: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  divisionButtonSelected: {
    backgroundColor: '#0000ff',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000',
    fontSize: 16,
    marginTop: 10,
  },
  tableContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: '#ccc',
  },
  headerCell: {
    marginHorizontal: 5,
    fontWeight: 'bold',
  },
  cellText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'left',
  },
  teamCell: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  teamIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  placeholderIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
  },
  teamName: {
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
    flexShrink: 1,
  },
});
