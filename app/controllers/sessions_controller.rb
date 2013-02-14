class SessionsController < ApplicationController
  
  # GET /sessions
  # GET /sessions.json
  
  def index
    
  end
  
  def create
    
    #What data comes back from OmniAuth?
    auth = request.env["omniauth.auth"]
    user = User.find_for_facebook_oauth(auth)
    session[:user_id] = user.id
    redirect_to messages_path, :notice => "Successfully Logged in using facebook!"
    
  end
  
  # DELETE /sessions/1
  # DELETE /sessions/1.json
  def destroy
    
    session[:user_id] = nil
    redirect_to root_url, :notice => "Logged out!"
    
  end
  
  
end