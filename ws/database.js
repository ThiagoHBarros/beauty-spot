const mongoose = require('mongoose');
const URI = 'mongodb+srv://usuario-salao:beautyspotsenha1@clusterdev.wo2xftu.mongodb.net/beauty-spot?retryWrites=true&w=majority';


mongoose
.connect(URI)
.then(() => console.log('DB subiu'))
.catch(() => console.log(err));