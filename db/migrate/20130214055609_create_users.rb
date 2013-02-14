class CreateUsers < ActiveRecord::Migration
  def change
    
    create_table :users do |t|
      ## Database authenticatable
      t.string :email, :null => false, :default => ""
      t.string :encrypted_password, :null => false, :default => ""
      t.string :facebook_image
      t.string :name
      t.string :uid          
      t.string :auth_token
      t.timestamps
      
    end
    
    add_index :users, :email, :unique => true
    
  end
end
