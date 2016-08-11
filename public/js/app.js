new Vue({
  el: '#events',
  data: {
    event: { name: '', description: '', date: '' },
    events: []
  },
  ready: function() {
    this.fetchEvents();
  },
  methods: {
    fetchEvents: function() {
      var events = [
      {
        id: 1,
        name: 'TIFF',
        description: 'Toronto International Film Festival',
        date: '2015-09-10'
      },
      {
        id: 2,
        name: 'The Martian Premiere',
        description: 'The Martian comes to theatres.',
        date: '2015-10-02'
      },
      {
        id: 3,
        name: 'SXSW',
        description: 'Music, film and interactive festival in Austin, TX.',
        date: '2016-03-11'
      }
    ];
    // $set is a convenience method provided by Vue that is similar to pushing
    // data onto an array
    this.$set('events', events);
    },

    addEvent: function() {
      if(this.event.name) {
        this.events.push(this.event);
        this.event = {name:'',description:'',date:''};
        var html = '<div class="alert alert-success alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>' + event.name + '</strong> has been added to the queue</div>';
        $('#alertsection').html(html);
      }
    },

    deleteEvent: function(index) {
      if(confirm("you sure to remove " + index)) {
        this.events.splice(index,1);
      }
    }
  }
})
