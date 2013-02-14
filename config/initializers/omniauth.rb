Rails.application.config.middleware.use OmniAuth::Builder do
  
  provider :facebook, '218735191584767','9ca4c0d03ac2bafb26dfe35e76e93da4',
  :scope => 'email,manage_friendlists,offline_access,photo_upload,publish_stream,read_friendlists,share_item,user_birthday,user_hometown,user_location,
    ,user_photos', :display => 'page'


end
