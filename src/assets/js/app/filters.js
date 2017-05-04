import Vue from 'vue';

Vue.filter('maxLength', function (orig, value) {
  if(orig){
    if( orig.length > value ){
      return orig.substring(0,value)+'...';
    }
    return orig;
  }
  return orig;
});

Vue.filter('trimSpaces', function (orig, value) {
  return orig.replace(/ /g,'');
});