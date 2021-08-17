const index = require("./index");
const { readFileSync } = require("fs")
const fs = require("fs")
const ms = require("ms")
const modifye = require("./modifyembed");
const Discord = require("discord.js")

function get(file) {
    if (!file) return;
    return JSON.parse(fs.readFileSync(`./${file}.json`, "utf8"));
}
let client;
let messages;
//let channels;

function save(file, variable) {
    if (!file || !variable) return
    fs.writeFileSync(`${file}.json`, JSON.stringify(variable, null, "\t"), err => {
        if (err) console.error(err);
        Sync()
            // code block
    });
}

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

function convert(hour, idenchere) {
    let dbgetprice = get('encheres')
    var mils = hour * 3600000
    dbgetprice[idenchere].duree_enchere = mils;
    save('encheres', dbgetprice)
}


module.exports = {
    modifytime(miliss, id2enchere, client) {
        while (miliss != 0) {
            sleep(1000)
            miliss = miliss - 1000
            convertMillisToTime(miliss, id2enchere);
        }
    },

    infos(client) {
        client = client;
        //channels = channels;
    },

    convertMillisToTime(millis, id2enchere, client) {
        let time = "Calcul en cours..."
        let delim = " ";
        let hours = Math.floor(millis / (1000 * 60 * 60) % 60);
        let minutes = Math.floor(millis / (1000 * 60) % 60);
        let seconds = Math.floor(millis / 1000 % 60);
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        time = hours + 'h' + delim + minutes + 'm' + delim + seconds + 's';
        let dbgetprice = get('encheres')
        newembed = new Discord.MessageEmbed()
            .setTitle('Nouvelle Enchère !')
            .setDescription(`La InsaneHosting vous propose une nouvelle enchère !`)
            .addField("Contenu de l'enchère :", dbgetprice[id2enchere].content_enchere)
            .addField("Prix actuel de l'enchère :", dbgetprice[id2enchere].prix_enchere + "€")
            .addField("Possesseur actuel de l'enchère :", dbgetprice[id2enchere].author)
            .addField("Durée de l'enchère :", time)
            .addField("ID de l'enchère :", dbgetprice[id2enchere].id_enchere)
            .addField('Pour pouvoir participer à l\'enchère tapez la commande', '`!encherir <votre prix> ' + dbgetprice[id2enchere].id_enchere + "`" + '\u200b')
            .setFooter("Créé par la InsaneStudio")
        client.channels.cache.get(dbgetprice[id2enchere].id_channel).messages.fetch(dbgetprice[id2enchere].id_embed).then((msg) => {
            msg.edit(newembed)
        })
    }
}