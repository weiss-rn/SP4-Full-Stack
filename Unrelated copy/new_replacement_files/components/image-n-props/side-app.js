import { View, Text, Image, StyleSheet } from 'react-native';

const ContactItem = ({ name, phone, imageUrl }) => {
  return (
    <View style={styles.contactItem}>
      <Image
        style={styles.avatar}
        source={{ uri: imageUrl }} 
      />
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{name}</Text>
        <Text style={styles.phoneText}>{phone}</Text>
      </View>
    </View>
  );
};

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kontak Dekengan Pusat</Text>
      </View>

      <View style={styles.listContainer}>
        <ContactItem 
          name="Anies Baswedan" 
          phone="0012345678" 
          imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Anies_Baswedan%2C_Candidate_for_Indonesia%27s_President_in_2024.jpg/250px-Anies_Baswedan%2C_Candidate_for_Indonesia%27s_President_in_2024.jpg" 
        />
        <ContactItem 
          name="Muhaimin Iskandar" 
          phone="00122226677" 
          imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Muhaimin_Iskandar%2C_Candidate_for_Indonesia%27s_Vice_President_in_2024.jpg/250px-Muhaimin_Iskandar%2C_Candidate_for_Indonesia%27s_Vice_President_in_2024.jpg" 
        />
        <ContactItem 
          name="Prabowo Subianto" 
          phone="00234568889" 
          imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Prabowo_Subianto_2024_official_portrait.jpg/250px-Prabowo_Subianto_2024_official_portrait.jpg" 
        />
        <ContactItem 
          name="Gibran Rakabuming" 
          phone="00234569998" 
          imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Gibran_Rakabuming_2024_official_portrait.jpg/250px-Gibran_Rakabuming_2024_official_portrait.jpg" 
        />
        <ContactItem 
          name="Ganjar Pranowo" 
          phone="003333887568" 
          imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Ganjar_Pranowo_Candidate_for_Indonesia%27s_President_in_2024.jpg/250px-Ganjar_Pranowo_Candidate_for_Indonesia%27s_President_in_2024.jpg" 
        />
        <ContactItem 
          name="Mahfud MD" 
          phone="00388777557" 
          imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Mahfud_MD%2C_Candidate_for_Indonesia%27s_Vice_President_in_2024.jpg/250px-Mahfud_MD%2C_Candidate_for_Indonesia%27s_Vice_President_in_2024.jpg" 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 40,
  },
  header: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#d6d6d6',
    borderTopWidth: 1,
    borderColor: '#4a4a4a',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#bbbbbb',
  },
  infoContainer: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 14,
    color: '#4fa5e0',
  },
});