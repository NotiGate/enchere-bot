const Discord = require('discord.js');
const { readFileSync } = require("fs")
const client = new Discord.Client();
const fs = require("fs")
const ms = require("ms");
const { clearInterval } = require('timers');
const { infos } = require('./modifyembed');
const modifyEmbed = require("./modifyembed")

function save(file, variable) {
    if (!file || !variable) return
    fs.writeFileSync(`${file}.json`, JSON.stringify(variable, null, "\t"), err => {
        if (err) console.error(err);
        Sync()
            // code block
    });
}

function get(file) {
    if (!file) return;
    return JSON.parse(fs.readFileSync(`./${file}.json`, "utf8"));
}


setInterval(function() {
    client.user.setPresence({ activity: { name: "Faire les enchères de la InsaneStudio.", type: 'PLAYING' }, status: 'dnd' });
}, 15000);
client.on('ready', () => {
    console.log(`${client.user.username} est lance !`)
})
client.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    const prefix = ".";
    const notifenchere = "<@839062668606046259>";
    let args = message.content.slice(message.content.startsWith(prefix) ? prefix.length : 0).trim().split(/ +/g)
    const command = args.shift().toLowerCase();

    if (command === "close") {
        let dbgetprice = get('encheres')

        let idenchere = args[0];

        if (message.author.id !== "743546716460154971" && "401067518774476800") return message.reply("Vous n'avez pas la permission de supprimer une enchère.");
        if (dbgetprice[args[0]] == undefined) return message.reply("**Cette enchère n'existe pas**, ``!close <ID de l'enchère>``")

        try {
            let dbgetprice = get('encheres')
            if (dbgetprice[args[0]].active == false) return (`**Enchère ${dbgetprice[args[0]].id_enchere} déja fermée.**`)
            dbgetprice[args[0]].active = false;
            save('encheres', dbgetprice)

            newembed = new Discord.MessageEmbed()
                .setTitle('Enchère fermée.')
                .setDescription(`La InsaneHosting vous a proposé une enchère.`)
                .addField("Contenu de l'enchère :", dbgetprice[args[0]].content_enchere)
                .addField("Dernier prix de l'enchère :", dbgetprice[args[0]].prix_enchere + "€")
                .addField("Vainqueur de l'enchère :", dbgetprice[args[0]].author)
                .addField("Durée de l'enchère :", convertMillisToTime(dbgetprice[args[0]].duree_enchere))
                .addField("ID de l'enchère :", dbgetprice[args[0]].id_enchere)


            client.channels.cache.get(dbgetprice[args[0]].id_channel).messages.fetch(dbgetprice[args[0]].id_embed).then((msg) => {
                msg.edit(newembed)
                message.channel.send(`**Bravo <@${dbgetprice[args[0]].author_id}>, vous avez gagner l'enchère, vous devez créer un ticket. <#751875957870297109>**`)
                let utilisator = client.users.cache.get(dbgetprice[args[0]].author_id)
                utilisator.send(`**Bravo <@${dbgetprice[args[0]].author_id}>, vous avez gagner l'enchère, vous devez créer un ticket. <#751875957870297109>**`)
            })

            message.reply(`L'enchère ${idenchere} à bien été fermer.`)
        } catch (e) {
            console.log(e)
            message.reply("*Une erreur sauvage est apparue...*")
        }

    }

    if (command === "encherir") {
        let encherprice = args[0];
        encherprice = Number(encherprice)
        encherprice = (encherprice).toFixed(1);

        let idenchere = args[1];

        let dbgetprice = get('encheres')
        if (dbgetprice[args[1]].active == false) return message.reply("**Cette enchère est fermée, vous ne pouvez donc pas enchérir dessus.**")
        if (dbgetprice[args[1]] == undefined) return message.reply("**Cette enchère n'existe pas**, ``!encherir <votre prix> <ID de l'enchère>``")
        if (isNaN(args[0] || (args[0] < 1 || args[0] > 1000))) return message.reply("Veuillez enter un **nombre** : !encherir <votre prix> <ID de l'enchère>.")
        if (encherprice == undefined) return message.reply("**Vous devez entrer un prix** : ``!encherir <votre prix> <ID de l'enchère>``");
        if (idenchere == undefined) return message.reply("**Vous devez entrer un ID** : ``!encherir <votre prix> <ID de l'enchère>``");
        if (dbgetprice[args[1]].prix_enchere > encherprice) return message.reply("**Il faut mettre un prix supérieur au dernier prix : " + dbgetprice[args[1]].prix_enchere + "€**")
        if (dbgetprice[args[1]].prix_enchere == encherprice) return message.reply("**Il faut mettre un prix supérieur au dernier prix : " + dbgetprice[args[1]].prix_enchere + "€**")
        message.reply("Vous allez enchérir ***" + encherprice + "€*** sur l'enchère ***" + dbgetprice[args[1]].id_enchere + "***. **VOUS NE POUVEZ PAS REVENIR EN ARRIERE !**")
        message.reply('**Veuillez confirmer votre enchérissement en envoyant "oui" ou "non"**')
        message.channel.awaitMessages((m) => m.author.id == message.author.id, { max: 1, time: 30000, errors: ['time'] })
            .then((collected) => {
                confirm = collected.first().content.toLowerCase();
                if (confirm == "oui") {
                    let dbgetprice = get('encheres')
                    if (dbgetprice[args[1]] == undefined) return message.reply("**Cette enchère n'existe pas**, ``!encherir <votre prix> <ID de l'enchère>``")
                    if (dbgetprice[args[1]].prix_enchere > encherprice) return message.reply("**Quelqu'un a enchéri : " + dbgetprice[args[1]].prix_enchere + "€ avant vous.**")
                    if (dbgetprice[args[1]].prix_enchere == encherprice) return message.reply("**Quelqu'un a enchéri : " + dbgetprice[args[1]].prix_enchere + "€ avant vous.**")
                    dbgetprice[args[1]] = {
                        ...dbgetprice[args[1]],
                        prix_enchere: encherprice,
                        author: message.author.tag,
                        author_id: message.author.id
                    }
                    save('encheres', dbgetprice)
                    message.reply("**Vous avez bien enchéri " + encherprice + "€ sur l'enchère " + idenchere + ".**")

                    newembed = new Discord.MessageEmbed()
                        .setTitle('Nouvelle Enchère !')
                        .setDescription(`La InsaneHosting vous propose une nouvelle enchère !`)
                        .addField("Contenu de l'enchère :", dbgetprice[args[1]].content_enchere)
                        .addField("Prix actuel de l'enchère :", dbgetprice[args[1]].prix_enchere + "€")
                        .addField("Possesseur actuel de l'enchère :", dbgetprice[args[1]].author)
                        .addField("Durée de l'enchère : (en heures)", dbgetprice[args[1]].duree_enchere)
                        .addField("ID de l'enchère :", dbgetprice[args[1]].id_enchere)
                        .setColor('RANDOM')
                        .addField('Pour pouvoir participer à l\'enchère tapez la commande', '`!encherir <votre prix> ' + dbgetprice[args[1]].id_enchere + "`" + '\u200b')
                        .setFooter("Créé par la InsaneStudio")

                    client.channels.cache.get(dbgetprice[args[1]].id_channel).messages.fetch(dbgetprice[args[1]].id_embed).then((msg) => {
                        msg.edit(newembed)
                    })

                } else {
                    message.reply("**Votre enchérissement à bien été annulé.**")
                }
            })
    }
    if (command === `new`) {
        if (message.author.id !== "743546716460154971" && "401067518774476800") return message.reply("Vous n'avez pas la permission de créer une enchère.");
        let contenuEnchere;
        let prixEnchere;
        let dureeEnchere;
        let confirm;
        let salonEnchere;
        message.channel.send("Premièrement, envoyez le contenu de l'enchère.")
        message.channel.awaitMessages((m) => m.author.id == message.author.id, {
                max: 1,
                time: 30000,
                errors: ['time']
            })
            .then((collected) => {
                contenuEnchere = collected.first().content;
                message.channel.send(`D'accord, le contenu de l'enchère est : ${contenuEnchere}.`)
                message.channel.send(`Maintenant, dites moi quel est le prix de début de l'enchère.`)
                message.channel.awaitMessages((m) => m.author.id == message.author.id, { max: 1, time: 30000, errors: ['time'] })
                    .then((collected) => {
                        prixEnchere = collected.first().content;
                        message.channel.send(`D'accord, le prix de l'enchère est : ${prixEnchere}€.`)
                        message.channel.send("Maintenant, dites moi les heures de l'enchères. (nombre d'heures, 2 par exemple)")

                        message.channel.awaitMessages((m) => m.author.id == message.author.id, { max: 1, time: 30000, errors: ['time'] })
                            .then((collected) => {
                                dureeEnchere = collected.first().content;
                                message.channel.send(`D'accord, la durée de l'enchères est : ${dureeEnchere}.`)
                                message.channel.send("Maintenant, envoyez moi l'id du salon ou je met l'enchère.")

                                message.channel.awaitMessages((m) => m.author.id == message.author.id, { max: 1, time: 30000, errors: ['time'] })
                                    .then((collected) => {
                                        salonEnchere = collected.first().content;

                                        message.channel.send(`Voici un récapitulatif de l'enchère. \n Contenu de l'enchère : ${contenuEnchere}. \n Prix de début de l'enchère : ${prixEnchere}€ \n Temps de l'enchère : ${dureeEnchere} \n Salon de l'enchère : <#${salonEnchere}>`)
                                        message.channel.send("Confirmer vous l'envoie de l'enchère ? (Oui/Non).")
                                        message.channel.awaitMessages((m) => m.author.id == message.author.id, { max: 1, time: 30000, errors: ['time'] })
                                            .then((collected) => {
                                                confirm = collected.first().content.toLowerCase();
                                                if (confirm == "oui") {
                                                    const dbsave = get('encheres')
                                                    let cree = 0
                                                    let idenchere = getRandomInt(9999)
                                                    if (dbsave[idenchere] != undefined && dbsave[idenchere].active == false) {
                                                        cree = 1
                                                        console.log("ForEdit")
                                                    }
                                                    if (dbsave[idenchere] != undefined && dbsave[idenchere].active == true) {
                                                        return message.reply("Id déja prise")
                                                    }

                                                    let id2enchere = idenchere
                                                    idenchere = new Discord.MessageEmbed()
                                                        .setTitle('Nouvelle Enchère !')
                                                        .setDescription(`La InsaneHosting vous propose une nouvelle enchère !`)
                                                        .addField("Contenu de l'enchère :", contenuEnchere)
                                                        .addField("Prix actuel de l'enchère :", prixEnchere + "€")
                                                        .addField("Durée de l'enchère :", "Calcul en cours...")
                                                        .addField("ID de l'enchère :", idenchere)
                                                        .setColor('RANDOM')
                                                        .addField('Pour pouvoir participer à l\'enchère tapez la commande', '`!encherir <votre prix> ' + idenchere + "`" + '\u200b')
                                                        .setFooter("Créé par la InsaneStudio")
                                                    let cha = client.channels.cache.get(salonEnchere)
                                                    cha.send('Notification : ' + notifenchere);
                                                    cha.send(idenchere).then((m) => {
                                                        let mid = m.id;
                                                        let cid = m.channel.id
                                                        if (cree == 0) {
                                                            let iden = Number(idenchere);


                                                            dbsave[id2enchere] = {
                                                                content_enchere: contenuEnchere,
                                                                prix_enchere: prixEnchere,
                                                                duree_enchere: dureeEnchere,
                                                                id_enchere: id2enchere,
                                                                id_embed: mid,
                                                                id_channel: cid,
                                                                author: "Personne",
                                                                active: true,
                                                                author_id: "Personne"
                                                            }
                                                            save('encheres', dbsave)
                                                        } else {
                                                            dbsave[id2enchere] = {
                                                                ...dbsave[id2enchere],
                                                                content_enchere: contenuEnchere,
                                                                prix_enchere: prixEnchere,
                                                                duree_enchere: dureeEnchere,
                                                                id_enchere: id2enchere,
                                                                id_embed: mid,
                                                                id_channel: cid,
                                                                author: "Personne",
                                                                active: true,
                                                                author_id: "Personne"
                                                            }
                                                            save('encheres', dbsave)
                                                        }
                                                        let dbgettime = get('encheres')
                                                        let mili = convert(dbgettime[id2enchere].duree_enchere, id2enchere)
                                                        let dbget = get('encheres')
                                                        let Timer = dbget[id2enchere].duree_enchere

                                                        message.reply(`Vous avez bien créé l'enchère. <#${salonEnchere}>`)
                                                        setTimeout(function() {
                                                            closeenchere(id2enchere, message, m.channel)
                                                        }, ms(String(Timer)))
                                                        let dbgetprice = get('encheres')
                                                        let miliss = dureeEnchere * 3600000
                                                        infos(client)
                                                            //modifyEmbed.modifytime(miliss, id2enchere, client)
                                                        const milis = setInterval(() => {
                                                            miliss = miliss - 5000
                                                            modifyEmbed.convertMillisToTime(miliss, id2enchere, client)
                                                            if (miliss <= 0) {
                                                                stopmis()
                                                            }
                                                        }, 5000)


                                                        function stopmis() {
                                                            clearInterval(milis)
                                                        }

                                                    })



                                                } else {
                                                    message.channel.send("Veuillez refaire la commande.")
                                                }

                                            })
                                            .catch((error) => {
                                                console.log(error)
                                                message.channel.send('Temps dépassé !');
                                            });
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                        message.channel.send('Temps dépassé !');
                                    });


                            })
                            .catch((collected) => {
                                message.channel.send('Temps dépassé !');
                            });
                    })
                    .catch((collected) => {
                        message.channel.send('Temps dépassé !');
                    });

            })
            .catch((collected) => {
                message.channel.send('Temps dépassé !');
            });

        let premprice = args[1];
    }
})

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}



function closeenchere(idenchere, message, channel) {
    let dbgetprice = get('encheres')

    try {
        let dbgetprice = get('encheres')
        dbgetprice[idenchere].active = false;
        save('encheres', dbgetprice)

        newembed = new Discord.MessageEmbed()
            .setTitle('Enchère fermée.')
            .setDescription(`La InsaneHosting vous a proposé une enchère.`)
            .addField("Contenu de l'enchère :", dbgetprice[idenchere].content_enchere)
            .addField("Dernier prix de l'enchère :", dbgetprice[idenchere].prix_enchere + "€")
            .addField("Vainqueur de l'enchère :", dbgetprice[idenchere].author)
            .addField("Durée de l'enchère :", convertMillisToTime(dbgetprice[idenchere].duree_enchere))
            .addField("ID de l'enchère :", dbgetprice[idenchere].id_enchere)


        client.channels.cache.get(dbgetprice[idenchere].id_channel).messages.fetch(dbgetprice[idenchere].id_embed).then((msg) => {
            msg.edit(newembed)
        })

        let end = client.channels.cache.get(dbgetprice[idenchere].id_channel)

        let utilisator = client.users.cache.get(dbgetprice[idenchere].author_id)
        let utilisator_id = dbgetprice[idenchere].author_id
        if (utilisator_id != "Personne") {
            utilisator.send(`**Bravo <@${dbgetprice[idenchere].author_id}>, vous avez gagner l'enchère, vous devez créer un ticket. <#751875957870297109>**`)
            end.send(`**Bravo <@${dbgetprice[idenchere].author_id}>, vous avez gagner l'enchère, vous devez créer un ticket. <#751875957870297109>**`)
        } else {
            end.send("Personne n'a gagné l'enchère " + dbgetprice[idenchere].id_enchere + ".")
        }

    } catch (e) {
        console.log(e)
    }

}

function convert(hour, idenchere) {
    let dbgetprice = get('encheres')
    var mils = hour * 3600000
    dbgetprice[idenchere].duree_enchere = mils;
    save('encheres', dbgetprice)
}




client.login("ODM5NzU1NjQzNzYxNDU5MjAw.YJORYw.eRnHRmp3mZXCVwT8dXB8NAJTP9U");