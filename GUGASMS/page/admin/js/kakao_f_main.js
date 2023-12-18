$(document).ready(function(){

    $.ajax({
        type: "GET",
        url: "https://msds.kosha.or.kr/openapi/service/msdschem/chemlist?serviceKey=3h5o8Pm7wctZGh8LPV70Bcu0Z38%2BE3swtfbcO3%2F4%2FLRh3E9E62nhm5o1JPLHNs7Sxb3MOxucrHIFmzxYWoOt8A%3D%3D&searchWrd=wd&searchCnd=0",
        dataType : 'jsonp',
        success : function(data){
          console.log('hihihi')
          console.log(location.origin)
           console.log(data)
           
        }
        , error : function(xhr, status, error){
          alert(xhr.status, xhr.responseText, error);
        }

      })

});

