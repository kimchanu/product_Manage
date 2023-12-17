$(document).ready(function(){

    $.ajax({
        type: "GET",
        url: "3h5o8Pm7wctZGh8LPV70Bcu0Z38%2BE3swtfbcO3%2F4%2FLRh3E9E62nhm5o1JPLHNs7Sxb3MOxucrHIFmzxYWoOt8A%3D%3D",
        data: {},
        success: function(data){
           let dusty_data = data['RealtimeCityAir']['row'];               
           for (let i = 0; i < dusty_data.length; i++) {
             put_data(i,dusty_data[i]['MSRDT'],dusty_data[i]['MSRSTE_NM'],dusty_data[i]['IDEX_NM'],dusty_data[i]['IDEX_MVL'])
           }
        }

      })

});

