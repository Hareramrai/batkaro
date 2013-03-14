Rails.application.config.middleware.use OmniAuth::Builder do
  
  provider :facebook, ENV["FACEBOOK_API_KEY"],ENV["FACEBOOK_API_SECRET"], :scope => 'email,manage_friendlists,offline_access,photo_upload,publish_stream,read_friendlists,share_item,user_birthday,user_hometown,user_location,
    ,user_photos', :display => 'page'


end
