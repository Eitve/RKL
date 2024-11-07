import React from 'react';
import { ScrollView } from 'react-native';
import NewsContainer from '../../components/NewsContainer';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = ({ navigation }: any) => {
  const newsData = [
    { 
      title: 'Taškų lenktynėse – VDU pergalė prieš jaunuosius vilniečius', 
      imageSource: require('../../assets/images/exampleNews.jpg'), 
      content: `Lapkričio 3d., 2024
Lapkričio 2 dieną Nostra.lt-RKL pirmenybėse įvyko vienerios rungtynės, kuriose Vytauto Didžiojo Universiteto (3-4) krepšininkai namuose 104:95 (19:26, 28:14, 29:29, 28:26) pranoko Vilniaus „Ryto-MRU“ (1-6) ekipą.

Pirmasis ketvirtis sėkmingesnis buvo svečiams iš Vilniaus (26:19), bet viskas apsivertė antrajame ketvirtyje, kurį VDU atstovai laimėjo 28:14 ir persvėrė rungtynių rezultatą savo naudai – 47:40.


Po pertraukos dvikovoje toliau vyravo galingas puolimas. Vilniečiai nuolat kvėpavo šeimininkams į nugarą, bet šiems didesnę ar mažesnę persvarą pavyko išlaikyti visų rungtynių metu.

Likus kiek mažiau nei dviem minutėms iki mačo pabaigos, svečiai sušvelnino deficitą iki 4 taškų – 93:97. Visgi tuomet VDU atsakė septynių taškų atkarpa ir atsakė į visus klausimus dėl nugalėtojo.

VDU komandoje rezultatyviausiai rungtyniavo Ričardas Butkus, pelnęs 17 taškų, Tomas Stankevičius surinko 14, Lukas Uosis pridėjo 13 taškų, o Domas Uosis pelnė 12 taškų bei atliko net 14 rezultatyvių perdavimų.

Vilniečiams Mantas Liutkevičius pelnė 24 taškus, Erikas Sirgedas surinko 18, Aironas Urbanovičius pridėjo 16 taškų.`
},
    { 
      title: 'Nostra.lt-RKL savaitės rungtynės keliasi į LRT.lt portalą.', 
      imageSource: require('../../assets/images/exampleNews2.png'), 
      content: `Spalio 31d., 2024
Regionų krepšinio lyga („Nostra.lt-RKL“) 2024-2025 m. sezoną pasitinka su dar viena nauja partneryste. Nuo lapkričio 2 d. visas čempionato savaitės TOP rungtynes nuo šiol bus galima stebėti portale LRT.lt. 

Regionų krepšinio lygos direktorius Remigijus Kuodis šią partnerystę įvardino labai svarbia siekiant dar labiau didinti lygos matomumą bei dėmesį Lietuvos regionams: „Toks bendradarbiavimas ne tik stiprina krepšinio kultūrą, bet ir suteikia galimybę regionams atsiskleisti plačiau. Be to, ši iniciatyva skatins vietos bendruomenių įsitraukimą, ši sinergija yra naudinga visiems – tiek žaidėjams, tiek fanams, tiek visai sporto bendruomenei”.

Trečiame pagal pajėgumą krepšinio čempionate iš viso varžosi 42 klubai iš visos Lietuvos. A divizione – 16, B divizione – 26. A diviziono nugalėtojai iškovoja teisę kilti aukštyn ir rungtyniauti Nacionalinėje krepšinio lygoje. Lygoje rungtyniaujančių žaidėjų amžiaus vidurkis – 21-eri metai.

Šiuo metu pirmenybėse jau yra sužaisti keturi turai, o kiekvieną savaitę organizuojamos savaitės rungtynės nuo lapkričio 2 d. bus transliuojamos LRT.lt portale. Rungtynes stebėti tiesiogiai bus galima kiekvieną šeštadienį nuo 15:00 val.

Nostra.lt-RKL penktojo turo savaitės rungtynėse Vytauto Didžiojo universiteto komanda savo aikštelėje priims Vilniaus Rytas-MRU komandą.`
    },
    { 
      title: 'A diviziono apžvalga: ryškėjantys lyderiai ir skirtingas naujokų startas', 
      imageSource: require('../../assets/images/exampleNews3.jpg'), 
      content: `Spalio 31d., 2024
Nostra.lt-RKL A divizione baigėsi spalio mėnesio kovos. Pirmajame sezono mėnesyje klubai sužaidė skirtingą rungtynių skaičių –nuo keturių iki septynių.

Pirmenybėse turime tik vieną likusią be pralaimėjimų žygiuojančią komandą – Kėdainių sporto centrą (6-0). Gedimino Butkaus auklėtiniai dominuoja sezono starte, kuriame tik šeštajame ture turėjo rimtą iššūkį, kuomet Klaipėdoje 94:92 palaužė LCC tarptautinį universitetą.

Kėdainiečių gretose labiausiai išsiskiria Lauryno Danieliaus (19,5 taško) ir Roko Ūzo (17 taškai) duetas.

„Sezono tikslas – pakliūti tarp keturių stipriausių komandų ir žaisti finalo ketverte. O ten jau kaip sakoma, laimės dalykas, viską gali lemti vienos blogai arba gerai sužaistos rungtynės, – teigė Kėdainių komandos treneris G. Butkus. – Tad progos tokias rungtynes žaisti ir būti svarbiausiame sezono renginyje norime ir šiemet“.

Kėdainiečiams iš paskos seka „Biržų“ (5-1) klubas, kuris vienintelę nesėkmę sezone patyrė Šilalėje, kur 76:82 nusileido „Lūšies“ krepšininkams.

Abi komandos praėjusiame sezone rungtyniavo Nostra.lt-RKL finalo ketverte. Tuomet kėdainiečiai krito finale, o biržiečiai liko treti.


Čempionate liko vienintelė komanda dar nepatyrusi pergalės skonio – tai Akmenės sporto centras (0-5).

Komanda stringa rungtyniaudami namuose, kur per trejas rungtynes rezultatyviausiai sužaidė prieš LCC tarptautinį universitetą, pelnydami 73 taškus (73:87).

Arčiausiai pergalės Akmenės miesto komanda atsidūrė praėjusiame ture, kuomet išvykoje dramatiškai 92:95 nusileido Šilalės „Lūšies“ krepšininkams.

Mažai kuo džiaugtis kol kas turi ir „Žalgirio“ (1-4) bei „Ryto“ (1-5) klubų jaunimas, pasiekęs po vieną pergalę čempionate.

Šios komandos jau sužaidė ir tarpusavio rungtynes. Tuomet vilniečiai namuose 92:80 pranoko principinį priešininką ir iškovojo kol vienintelę pergalę šį sezoną.

Skirtingai A diviziono startas klostosi pernai B divizione rungtyniavusioms komandoms. Jei Birštono „Milasta“ (4-2) turi kuo pasidžiaugti, tai „Druskininkams“ (1-6) dar reiks atrasti pergalingą receptą.

Druskininkiečiai yra daugiausiai pralaimėjimų patyrusi ekipa šiame sezone, o vienintelę pergalę šie pasiekė sutriuškinę VDU krepšininkus (101:80).

Tuo metu B diviziono čempionai sezono eigoje pasipildė skambiu pirkinių, į komandą pasikviesdami 45-erių veteraną Mindaugą Lukauskį, kuris tikrai duoda apčiuopiamos naudos naujokams.


Krepšinio mohikanas rungtyniauja po 27,5 minutės, renka po 12,3 taško ir yra antras pagal rezultatyvumą komandoje, nusileisdamas tik Ovidijui Varanauskui (26,2 taško).

Keturias pergales pasiekę birštoniečiai dalinasi 3-4 vietas su Šiaulių r. „Grafu-Kuršėnų SM“ atstovais, tiesa, šiuos dar aplenkti gali tiek pat pergalių bei vieneriomis rungtynėmis mažiau sužaidusios „Tauragės“, „Raseinių„ ir Kazlų Rūdos „Ataka“-Kauno kolegija komandos.

Apžvelgianti individualius krepšininkų pasirodymus, turime penkis krepšininkus, kurie fiksuoja 20 arba didesnį naudingumo balų vidurkį A divizione.

Naudingiausias čempionate – Kauno „Žalgirio-3“ atstovas Jokūbas Rudaitis, pelnantis po 28 taškus ir renkantis po 24 naudingumo balus.

Jam už nugaros rikiuojasi Birštono „Milastos“ gynėjas Ovidijus Varanauskas (23,5 naud. b.), prieniškis Domantas Šeškus (21,5 naud. b.), „Biržų“ atstovas Vytautas Saulis (21,3 naud. b.) ir „Kupiškio“ krepšininkas Justas Maceikis (20 naud. b.).


Sekančios A diviziono rungtynės įvyks lapkričio 2 dieną, kuomet VDU namuose priims Vilniaus „Ryto-MRU“ krepšininkus.`
    },
    { 
      title: 'A diviziono apžvalga: ryškėjantys lyderiai ir skirtingas naujokų startas', 
      imageSource: require('../../assets/images/exampleNews4.jpg'), 
      content: ``
    },

    
  ];

  const handlePress = (imageSource: any, title: string, content: string) => {
    navigation.navigate('NewsDetail', { imageSource, title, content });
  };

  return (
    <SafeAreaView> 
    <ScrollView>
      {newsData.map((news, index) => (
        <NewsContainer
          key={index}
          imageSource={news.imageSource}
          title={news.title}
          onPress={() => handlePress(news.imageSource, news.title, news.content)}
        />
      ))}
    </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
