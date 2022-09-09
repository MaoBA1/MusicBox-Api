const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const SuperUser = require('../models/superUser');
const Gener = require('../models/gener');
const Song = require('../models/song');
const Album = require('../models/album');
const auth = require('./auth');
const moment = require('moment');

router.post('/creatNewSong', auth, async (request, response) => {
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) {
            SuperUser.findOne({accountId: accountId})
            .then(async artist => {
                if(artist) {
                    const{
                        trackName,
                        trackLength,
                        trackImage,
                        trackUri,
                        trackTags,gener
                    } = request.body;  
                    console.log(request.body);                  
                    const _song = new Song({
                        _id: mongoose.Types.ObjectId(),
                        trackName: trackName,
                        artistName: artist.artistName,
                        artistId: artist._id,
                        trackLength: trackLength,
                        trackImage: trackImage,
                        trackUri: trackUri,
                        gener: gener,
                        trackTags: trackTags
                    })
                    let artistSingles = artist.singles;
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

router.put('/updateSong/:songId', auth, async(request, response) => {
    const songId = request.params.songId;
    Song.findById(songId)
    .then(async song => {
        if(song) {
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

 router.delete('/removeSong/:songId', auth, async(request, response) => {
     const songId = request.params.songId;
     const accountId = request.account._id;
     const artist = await SuperUser.findOne({accountId: accountId});
     const singles = artist.singles.filter(trackId => trackId._id != songId);
     artist.singles = singles;
     artist.save();     
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

router.get('/getAllArtistSong/:artistId', auth, async(request, response) => {
    const artistId = request.params.artistId;
    SuperUser.findOne({_id: artistId})    
    .then(artist => {
        if(artist) {
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

router.put('/addSongToPlaylist/:playlistId/:songId', auth, async(request, response) => {
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) {
            const {playlistId, songId} = request.params;
            Song.findById(songId)
            .then(async song => {
                if(song){
                    const trackName = song.trackName;
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
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) {
            const songId = request.params.songId;            
            const playlistId = request.params.playlistId;
            const playlist = user.playlists.filter(x => x._id == playlistId)[0];
            const songList = playlist.songs.filter(song => song._id != songId);
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

router.put('/likeSong/:songId', auth, async(request, response) => {
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) {
            const songId = request.params.songId;
            Song.findById(songId)
            .then(async song => {
                if(song){
                    const favoritesSongList = user.playlists.filter(x => x.playlistName == "Song That You Liked")[0];
                    if(favoritesSongList) {
                        user.playlists.map(playlist => {
                            if(playlist == (favoritesSongList)) {
                                const isSongLiked = playlist.songs.filter(x => x._id.equals(song._id))[0];
                                if(!isSongLiked){
                                    playlist.songs.push({trackName: song.trackName, _id: song._id});
                                    song.likes = song.likes+1;
                                }                                
                            }
                        })
                    } else {
                        console.log(user.playlists);
                        user.playlists.push({
                            _id: mongoose.Types.ObjectId(),
                            playlistName: "Song That You Liked", 
                            songs: [{trackName: song.trackName, _id: song._id}]
                        })
                        song.likes = song.likes+1;
                    }                    
                    song.save();
                    return user.save()
                    .then(user_updated => {
                        return response.status(200).json({
                            User: user_updated
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

router.put('/unlikeSong/:songId', auth, async(request, response) => {
    const accountId = request.account._id;
    User.findById(accountId)
    .then(async user => {
        if(user) {
            const songId = request.params.songId;
            Song.findById(songId)
            .then(async song => {
                if(song) {
                    user.playlists.map(playlist => {
                        if(playlist.playlistName == "Song That You Liked") {
                            const updated_playlist = playlist.songs.filter(x => !x._id.equals(song._id)); 
                            playlist.songs = updated_playlist;         
                            song.likes = song.likes-1;
                            song.save();
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

router.put('/addSongToAlbum/:albumId/:songId', auth, async(request, response) => {
    const accountId = request.account._id;
    const albumId = request.params.albumId;
    Album.findById(albumId)
    .then(async album => {
        if(album) {
            const songId = request.params.songId;
            const isTrackInAlbum = album.tracks.filter(x => x._id == songId)[0];
            if(isTrackInAlbum) {
                return response.status(200).json({
                    message: 'Song already in the album'
                })
            } else {
                Song.findById(songId)
                .then(async song => {
                    if(song) {
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


router.get('/getArtistLatestReleases/:artistId', auth, async(request, response) => {
    const artistId = request.params.artistId;
    SuperUser.findOne({_id: artistId}) 
    .then(artist => {
        if(artist) {
            Song.find({artistId: artistId})
            .then(artistSongList => {
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

router.get('/getArtistTop5Songs/:artistId', auth, async(request, response) => {
    const artistId = request.params.artistId;
    console.log(artistId);
    Song.find({artistId: artistId})
    .then(songs => {
        let songList = songs.filter(song => song.likes.length > 0);
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





module.exports = router;