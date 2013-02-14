class User < ActiveRecord::Base
  attr_accessible :uid, :email, :facebook_image, :auth_token, :name
  
  has_many :messages
  
  # @Params : auth
  # @Return : user
  # @Purpose : To find or create new user from facebook oauth
  def self.find_for_facebook_oauth(auth)
    
    user = User.where(:email => auth.info.email, :uid => auth.uid).first
    
    unless user
     user = User.create(:uid => auth.uid,
        :email => auth.info.email,
        :facebook_image => auth.info.image,
        :auth_token => auth.credentials.token,
        :name => auth.info.name
      )
      
    else
        
      user.update_attributes(:auth_token => auth.credentials.token , :facebook_image => auth.info.image)
        
    end
      
    user
      
  end # end of find_for_facebook_oauth
end
