var spotifyItemType = {
  ARTIST: 1,
  ALBUM: 2,
  TRACK: 3,
  PLAYLIST: 4
};

var spotifyItemStatus = {
  QUEUED: 0,
  DOWNLOADING: 1,
  FINISHED: 2
};

new Vue({
  el: '#events',
  data: {
    config: { listLimit: 10 },
    consts: { type: spotifyItemType, status: spotifyItemStatus },
    spotifyQuery: "",
    searchResult: { uri: '', name: '', type: '', image_link: '', spotify_link: '' },
    searchResults: [],
    spotifyItem: { uri: '', type: '', name: '', artist: '', status: '', date_added: '', date_download_started: '', date_download_finished: '' },
    queue: []
  },
  ready: function() {
    this.fetchQueueItems();
  },
  methods: {
    fetchQueueItems: function() {
      var queue = [
      {
        id: 1,
        uri: '123',
        type: spotifyItemType.ALBUM,
        name: 'abc',
        artist: 'random guy',
        status: spotifyItemStatus.QUEUED,
        date_added: '',
        date_download_started: '',
        date_download_finished: ''
      },{
        id: 2,
        uri: '123',
        type: spotifyItemType.ALBUM,
        name: 'def',
        artist: 'elephant',
        status: spotifyItemStatus.DOWNLOADING,
        date_added: '',
        date_download_started: '',
        date_download_finished: ''
      },{
        id: 3,
        uri: '123',
        type: spotifyItemType.ALBUM,
        name: '123',
        artist: 'The Artist',
        status: spotifyItemStatus.FINISHED,
        date_added: '',
        date_download_started: '',
        date_download_finished: ''
      },
    ];
    // $set is a convenience method provided by Vue that is similar to pushing
    // data onto an array
    this.$set('queue', queue);
    },

    addToQueue: function(uri) {
      for (item of this.searchResults.items) {
        if(item.uri == uri) {
            console.log(item);
        }

      }
    },

    addEvent: function() {
      if(this.spotifyItem.uri) {
        this.queue.push(this.spotifyItem);
        this.spotifyItem = { uri: '', type: '', name: '', artist: '', status: '', date_added: '', date_download_started: '', date_download_finished: '' };
        var html = '<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>' + spotifyItem.name + '</strong> has been added to the queue</div>';
        $('#alertsection').html(html);
      }
    },

    deleteEvent: function(index) {
      if(confirm("you sure to remove " + index)) {
        this.queue.splice(index,1);
      }
    },

    queryAPI: function(event){
      this.$http.get('/search?q=' + encodeURIComponent(this.spotifyQuery)).then((response) => {
        console.log(response);
        var data = JSON.parse(response.body);
        this.searchResults = data;
      }, (response) => {
        this.searchResults = [];
        console.error(response);
      });
    }
  }
});

var filter = function(text, length, clamp){
  clamp = clamp || '...';
  var node = document.createElement('div');
  node.innerHTML = text;
  var content = node.textContent;
  return content.length > length ? content.slice(0, length) + clamp : content;
};

Vue.filter('truncate', filter);
