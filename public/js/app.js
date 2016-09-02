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
      var self = this;
      this.$http.get('/queue').then((response) => {
        console.group('queue data');
        console.log(response.data);
        console.groupEnd('queue data');
        this.$set('queue', response.data);
        $('[data-toggle="tooltip"]').tooltip();
      }, (response) => {
        $('#queuetable tbody').append('<tr><td colspan="4">Nothing in queue...</td></tr>');
      });
    },

    addToQueue: function(uri) {
      //spotifyItem: { uri: '', type: '', name: '', artist: '', status: '', date_added: '', date_download_started: '', date_download_finished: '' },
      for (item of this.searchResults.items) {
        if(item.uri == uri) {
            var newItem = {};
            $.extend(newItem, this.spotifyItem, item);
            newItem.status = spotifyItemStatus.QUEUED;
            newItem.date_added = new Date().toISOString();
            console.log(newItem);

            this.$http.post('/queue', newItem).then((response) => {
              this.queue.push(newItem);
              var html = '<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>The ' + newItem.type.capitalize() + ' </strong>"' + newItem.name + '"</strong> has been added to the queue</div>';
              $('#alertsection').html(html);
            }, (response) => {
              var responseClass = response.data.status == "ok" ? 'success' : 'danger';
              var html = '<div class="alert alert-'+responseClass+' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+response.data.msg+'</div>';
              $('#alertsection').html(html);
            });


        }

      }
    },

    removeFromQueue: function(index) {
      if(confirm("Are you sure that you want to remove this element from the queue?")) {
        var removedItem = this.queue.splice(index,1)[0];
        this.$http.post('/dequeue', {id: removedItem.id}).then((response) => {
          var responseClass = response.data.status == "ok" ? 'success' : 'danger';
          var html = '<div class="alert alert-'+responseClass+' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+response.data.msg+'</div>';
          $('#alertsection').html(html);
        }, (response) => {
          var responseClass = response.data.status == "ok" ? 'success' : 'danger';
          var html = '<div class="alert alert-'+responseClass+' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+response.data.msg+'</div>';
          $('#alertsection').html(html);
        });
      }
    },

    queryAPI: function(event){
      $('#search-submit').attr('disabled', true).text('Querying...');

      this.$http.get('/search?q=' + encodeURIComponent(this.spotifyQuery)).then((response) => {
        console.log(response);
        var data = JSON.parse(response.body);
        this.searchResults = data;
        $('#search-submit').attr('disabled', false).text('Submit');
      }, (response) => {
        this.searchResults = [];
        console.error(response);
        $('#search-submit').attr('disabled', false).text('Submit');
      });
    }
  }
});

Vue.filter('truncate', function(text, length, clamp){
  clamp = clamp || '...';
  var node = document.createElement('div');
  node.innerHTML = text;
  var content = node.textContent;
  return content.length > length ? content.slice(0, length) + clamp : content;
});

Vue.filter('notEmpty', function (arr) {
  return arr.length > 0;
});

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});
