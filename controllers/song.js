const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const SuperUser = require('../models/superUser');
const Gener = require('../models/gener');
const Song = require('../models/song');
const Album = require('../models/album');
const auth = require('./auth');

// This request uses to create new song
router.post('/creatNewSong', auth, async (request, response) => {
    // account id of the current user 
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) {
            // we look for artist with the same account id
            SuperUser.findOne({accountId: accountId})
            .then(async artist => {
                if(artist) {
                    // this all the details of the song that we got from the body of the request
                    const{
                        trackName,
                        trackLength,
                        trackImage,
                        trackUri,
                        trackTags,gener
                    } = request.body;  
                    console.log(request.body);                  
                    // we create new song record with all the details
                    const _song = new Song({
                        _id: mongoose.Types.ObjectId(),
                        trackName: trackName,
                        artistName: artist.artistName,
                        artistId: artist._id,
                        trackLength: trackLength,
                        // incase the user didn't pick image for his new song 
                        // the song get default somg image url
                        trackImage: trackImage || 'https://firebasestorage.googleapis.com/v0/b/musicboxapp-aad61.appspot.com/o/assets%2Ficon.png?alt=media&token=a1dbac52-a561-4db1-b0fd-e0ea4283ae5a',
                        trackUri: trackUri,
                        gener: gener,
                        trackTags: trackTags
                    })
                    let artistSingles = artist.singles;
                    // we push the song to artist singles array
                    // we save the changes for this artist
                    // wa save the new song record
                    artistSingles.push(_song);
                    artist.singles = artistSingles; 
                    artist.save();
                     _song.save()
                    .then(newSong => {
                        return response.status(200).json({
                            status: true,
                            Song: newSong
                        })
                    })
                    .catch(error => {
                        return response.status(500).json({
                            status: false,
                            Error: error
                        })
                    })
                } else {
                    return response.status(200).json({
                        status: false,
                        message: 'Your account not recognize as artist'
                    })
                }
            })
            .catch(error => {
                return response.status(500).json({
                    status: false,
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                status: false,
                message: 'user not found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })

})

// This request uses to change song details
router.put('/updateSong/:songId', auth, async(request, response) => {
    // song id
    const songId = request.params.songId;
    Song.findById(songId)
    .then(async song => {
        if(song) {
            // all the song new details
            const{
                trackName,
                trackLength,
                trackImage,
                trackUri,
                trackTags
            } = request.body;
            song.trackName = trackName;
            song.trackLength = trackLength;
            song.trackImage = trackImage;
            song.trackUri = trackUri;
            song.trackTags = trackTags;
            return song.save()
            .then(song_upadated => {
                return response.status(200).json({
                    Song: song_upadated
                })
            })
            .catch(error => {
                return response.status(500).json({
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                message: 'Song not found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })

})

// This request uses to remove song by song id
 router.delete('/removeSong/:songId', auth, async(request, response) => {
    // song id
     const songId = request.params.songId;
     // account id of the current user
     const accountId = request.account._id;
     // artist id of this account
     const artist = await SuperUser.findOne({accountId: accountId});
     // we filter the song with the same id from the artist singles
     const singles = artist.singles.filter(trackId => trackId._id != songId);
     artist.singles = singles;
     // we save the changes for this artist
     artist.save();     
     // we delete the song with the same song id
     Song.findByIdAndDelete(songId)
     .then(song_deleted => {
         return response.status(200).json({
             message: `${song_deleted.trackName} is deleted`
         })
     })
     .catch(() => {
         return response.status(403).json({
             message: 'Song not exists'
         })
     })     
})

// This request uses to get all artist song by artist id
router.get('/getAllArtistSong/:artistId', auth, async(request, response) => {
    // artist id
    const artistId = request.params.artistId;
    SuperUser.findOne({_id: artistId})    
    .then(artist => {
        if(artist) {
            // We are looking for all songs belonging to this artist
            Song.find({artistId: artist._id})
            .then(artistSongList => {
                return response.status(200).json({
                    status: true,
                    ArtistSongs: artistSongList
                })
            })
            .catch(error => {
                return response.status(500).json({
                    status: false,
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                status: false,
                message: 'Artist not found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error
        })
    })
})


// This request uses to add song to playlist of the current user (regular user)
router.put('/addSongToPlaylist/:playlistId/:songId', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) {
            // playlist id that we want to add song to it,
            // song id
            const {playlistId, songId} = request.params;
            // we look for song with the same id that we got
            Song.findById(songId)
            .then(async song => {
                if(song){
                    const trackName = song.trackName;
                    // we look for playlist with the same id that we got
                    // and we push to it song object with name and id
                    user.playlists.map(playlist => {
                        if(playlist._id == playlistId){
                            playlist.songs.push({trackName: trackName, _id:songId})
                            return user.save()
                            .then(user_updated => {
                                return response.status(200).json({
                                    User: user_updated
                                })
                            })
                        } 
                    })
                } else {
                    return response.status(403).json({
                        message: 'Song not found'
                    })
                }
            })
            .catch(error => {
                return response.status(500).json({
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                message: 'User Not Found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})

router.put('/removeSongFromPlaylist/:playlistId/:songId', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) {
            // song id
            const songId = request.params.songId;            
            // playlist id 
            const playlistId = request.params.playlistId;
            // we find the required playlist from the user playlist
            const playlist = user.playlists.filter(x => x._id == playlistId)[0];
            // we filter this song from the playlist 
            const songList = playlist.songs.filter(song => song._id != songId);
            // we find that playlist and we change it to the filtered playlist
            user.playlists.map(playlist => {
                if(playlist._id == playlistId){
                    playlist.songs = songList;
                    return user.save()
                    .then(user_updated => {
                        return response.status(200).json({
                            User: user_updated
                        })
                    })
                }
            })
        } else {
            return response.status(403).json({
                message: 'User not found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})


// This request uses to add song to artist album 
router.put('/addSongToAlbum/:albumId/:songId', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    // artist id
    const albumId = request.params.albumId;
    // we look for album with the same id that we got
    Album.findById(albumId)
    .then(async album => {
        if(album) {
            // song id
            const songId = request.params.songId;
            // we check if the song already in this album
            const isTrackInAlbum = album.tracks.filter(x => x._id == songId)[0];
            if(isTrackInAlbum) {
                // if this song already in the album
                // we return message about it
                return response.status(200).json({
                    message: 'Song already in the album'
                })
            } else {
                // else we look for this song
                Song.findById(songId)
                .then(async song => {
                    if(song) {
                        // and we add this song to the album tracks with all the required details
                        // and we save the record
                        const artist = await SuperUser.findOne({accountId: accountId});
                        album.tracks.push({
                            _id: songId,
                            trackName: song.trackName,
                            artistName: artist.artistName,
                            artistId: artist._id,
                            trackLength: song.trackLength,
                            trackImage: song.trackImage,
                            trackUri: song.trackUri,
                            gener: song.gener,
                            trackTags: song.trackTags,
                            views: song.views,
                            likes: song.likes                            
                        })
                        return album.save()
                        .then(album_updated => {
                            return response.status(200).json({
                                Album: album_updated
                            })
                        })
                    } else {
                        return response.status(403).json({
                            message: 'Song not found'
                        })
                    }
                })
                .catch(error => {
                    return response.status(500).json({
                        Error: error
                    })
                })
            }

            
        } else {
            return response.status(403).json({
                message: 'Album not found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            Error: error
        })
    })
})

// This request uses to get 5 latest releases of artist by artist id
router.get('/getArtistLatestReleases/:artistId', auth, async(request, response) => {
    // artist id
    const artistId = request.params.artistId;
    SuperUser.findOne({_id: artistId}) 
    .then(artist => {
        if(artist) {
            // we look for all the song of this artist
            Song.find({artistId: artistId})
            .then(artistSongList => {
                // we sort this songs list by releas date desc
                // and return five from the bgining of the sorted list
                let songList = artistSongList.sort((a, b) => (new Date(b.creatAdt) - new Date(a.creatAdt)));
                songList.slice(0,5)
                return response.status(200).json({
                    status: true,
                    Songs: songList
                })
            })
            .catch(error => {
                return response.status(500).json({
                    status: false,
                    Error: error
                })
            })
        } else {
            return response.status(403).json({
                status: false,
                message: 'Artist not found'
            })
        }
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error
        })
    })
})

// This request uses to get top 5 liked songs of artist by artist id
router.get('/getArtistTop5Songs/:artistId', auth, async(request, response) => {
    // artist id
    const artistId = request.params.artistId;
    console.log(artistId);
    // We are looking for all songs belonging to this artist
    Song.find({artistId: artistId})
    .then(songs => {
        let songList = songs.filter(song => song.likes.length > 0);
        // we sort this songs list by likes count desc
        // and return five from the bgining of the sorted list
        songList = songList.sort((a,b) => (b.likes.length - a.likes.length))
        songList = songList.slice(0,5);
        return response.status(200).json({
            status: true,
            Songs: songList
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})

// This request uses to get all the songs by the current user favorite geners
router.get('/getSongsByUserFavoritesGeners', auth, async(request, response) => {
    // account id of the current user
    const accountId = request.account._id;
    await User.findById(accountId)
    .then(async account => {
        // account favorites geners
        let accountFavoriteGeners = account.favoritesGeners;
        let list = [];
        await Gener.find({})
        .then(async geners => {
            await Song.find({})
            .then(songs => {
                // we sort the favorites user geners
                accountFavoriteGeners.forEach(async (item, index) => {
                    // current gener for each loop
                    let currentGener = geners.filter(x => x._id.toString() === item._id.toString());
                    // we look for all the song that belong to this gener
                    let songsByCurrentGener = songs.filter(x => x.gener._id.toString() === currentGener[0]._id.toString());
                    // in each loop we push song list and gener to the list that we will return to the fronted
                    list.push({
                        gener:currentGener[0],
                        songs: songsByCurrentGener
                    })
                })
                return response.status(200).json({
                    status:true,
                    List: list
                })
            })
        })
        
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error.message
        })
    })
})

// this request uses to get all the songs that exist in the app
router.get('/getAllSongs', auth, async(request, response) => {
    await Song.find({})
    .then((songs) => {
        return response.status(200).json({
            status: true,
            Songs: songs
        })
    })
    .catch(error => {
        return response.status(500).json({
            status: false,
            Error: error
        })
    })
})




module.exports = router;